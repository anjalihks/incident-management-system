jest.mock("../src/models/incident.model", () => ({
  getAllIncidents: jest.fn(),
  addRCA: jest.fn(),
  updateStatus: jest.fn()
}));

jest.mock("../src/models/signal.model", () => ({
  find: jest.fn()
}));

const Incident = require("../src/models/incident.model");
const { addRCA, nextState } = require("../src/controllers/incident.controller");

function createMockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };
}

describe("incident controller RCA and state transitions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("rejects incomplete RCA payload", async () => {
    const req = {
      params: { id: "1" },
      body: {
        start_time: "2026-04-30T10:00",
        end_time: "2026-04-30T10:30",
        category: "Application",
        fix: ""
      }
    };
    const res = createMockRes();

    await addRCA(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "RCA incomplete" });
    expect(Incident.addRCA).not.toHaveBeenCalled();
  });

  test("rejects invalid RCA datetime format", async () => {
    const req = {
      params: { id: "1" },
      body: {
        start_time: "not-a-date",
        end_time: "2026-04-30T10:30",
        category: "Application",
        fix: "Rollback",
        prevention: "Canary"
      }
    };
    const res = createMockRes();

    await addRCA(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid RCA time format" });
    expect(Incident.addRCA).not.toHaveBeenCalled();
  });

  test("rejects RCA when end_time is not after start_time", async () => {
    const req = {
      params: { id: "1" },
      body: {
        start_time: "2026-04-30T10:30",
        end_time: "2026-04-30T10:00",
        category: "Infrastructure",
        fix: "Restart service",
        prevention: "Add alerts"
      }
    };
    const res = createMockRes();

    await addRCA(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "RCA end_time must be after start_time"
    });
    expect(Incident.addRCA).not.toHaveBeenCalled();
  });

  test("submits valid RCA payload", async () => {
    const req = {
      params: { id: "5" },
      body: {
        start_time: "2026-04-30T09:00",
        end_time: "2026-04-30T09:20",
        category: "Network",
        fix: "Reset route",
        prevention: "Monitor packet loss"
      }
    };
    const res = createMockRes();
    const updated = { id: 5, status: "RESOLVED" };
    Incident.addRCA.mockResolvedValue(updated);

    await addRCA(req, res);

    expect(Incident.addRCA).toHaveBeenCalledWith("5", req.body);
    expect(res.json).toHaveBeenCalledWith(updated);
  });

  test("blocks closing resolved incident without RCA", async () => {
    const req = { params: { id: "7" } };
    const res = createMockRes();
    Incident.getAllIncidents.mockResolvedValue([
      { id: 7, status: "RESOLVED", rca: null }
    ]);

    await nextState(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Cannot CLOSE without RCA" });
    expect(Incident.updateStatus).not.toHaveBeenCalled();
  });

  test("allows closing resolved incident with RCA", async () => {
    const req = { params: { id: "8" } };
    const res = createMockRes();
    Incident.getAllIncidents.mockResolvedValue([
      { id: 8, status: "RESOLVED", rca: { category: "Application" } }
    ]);
    Incident.updateStatus.mockResolvedValue({ id: 8, status: "CLOSED" });

    await nextState(req, res);

    expect(Incident.updateStatus).toHaveBeenCalledWith("8", "CLOSED");
    expect(res.json).toHaveBeenCalledWith({ id: 8, status: "CLOSED" });
  });
});
