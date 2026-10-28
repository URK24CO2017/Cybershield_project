# CyberShield: Adaptive Secure Smart Laboratory

> **CyberShield: Adaptive Secure Smart Laboratory with Cybersecurity Digital Twin, Risk-Adaptive Access Control, Privacy-Preserving Simulation, and Intelligent Threat Detection**  
> *Full-Stack College / MSc Applied AI & Cybersecurity Capstone Project*

---

## 🛡️ Project Overview

**CyberShield** is a fully functional, production-ready cybersecurity platform developed to protect smart cyber-physical laboratories. The application integrates:
1. **Risk-Adaptive Zero-Trust Access Control (R-AAC)**: A context-aware policy engine where strict role authorization takes precedence over risk scores, and dynamic risk scoring determines authentication friction.
2. **Cybersecurity Digital Twin**: An interactive 3D isometric and 2D architectural virtual laboratory model with live device telemetry status pins and one-click quarantine isolation.
3. **Defensive Attack Simulation Engine**: MITRE ATT&CK kill-chain propagation models (phishing, lateral movement, credential dumping) with defensive network containment.
4. **Intelligent AI Threat Detection**: A real, reproducible anomaly detection baseline using `scikit-learn` Isolation Forest, providing a 2x2 confusion matrix, accuracy, precision, recall, and F1-score.
5. **Privacy-Preserving Access Control Simulation**: A core research innovation combining $\varepsilon$-Differential Privacy (Laplace Mechanism) and HMAC-SHA256 pseudonymization, evaluating the quantitative Pareto trade-off between privacy protection and access decision utility.

---

## 🚀 Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite 8, TypeScript, Tailwind CSS v4 |
| **Data Visualization** | Recharts (Area, Line, Donut charts), SVG topology graphs |
| **Icons & Aesthetics** | Lucide React, Glassmorphism, Dark Navy `#0B132B` theme |
| **Backend API** | Python 3.9+, FastAPI, Uvicorn, Pydantic v2 |
| **Database & ORM** | SQLite (development) with PostgreSQL-compatible SQLAlchemy models |
| **AI / Machine Learning** | scikit-learn (`IsolationForest`, `StandardScaler`), pandas, NumPy |
| **Security & Privacy** | Native bcrypt password hashing, Python-Jose (JWT), HMAC-SHA256, Laplace DP Mechanism |
| **Testing** | pytest, FastAPI TestClient (`httpx`) |

---

## 📦 Project Structure

```
cps_project/
├── backend/
│   ├── app/
│   │   ├── core/           # Config, database engine, bcrypt security, deps, seeder
│   │   ├── models/         # SQLAlchemy ORM models (Users, Devices, Requests, Policies, Logs)
│   │   ├── schemas/        # Pydantic v2 validation models
│   │   ├── routers/        # 12 documented FastAPI endpoints
│   │   ├── services/       # R-AAC engine, Digital Twin, Attack simulator, Privacy engine
│   │   ├── ml/             # scikit-learn Isolation Forest model & synthetic data generator
│   │   └── main.py         # FastAPI application entrypoint with lifespan startup
│   ├── tests/
│   │   └── test_backend.py # 10 automated pytest tests
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/     # Sidebar, Header, Notification Center modal
│   │   ├── context/        # AuthContext (JWT session management)
│   │   ├── pages/          # All 12 application pages
│   │   ├── services/       # Centralized typed API client
│   │   ├── types/          # TypeScript interface definitions
│   │   └── App.tsx         # Routing & layout orchestration
│   ├── public/assets/      # 3D isometric lab render & cyber hero assets
│   ├── package.json
│   └── vite.config.ts
├── .env.example
├── .gitignore
└── README.md
```

---

## ⚡ Quick Start & Installation

### Prerequisites
- Python 3.9+ installed
- Node.js v18+ and npm installed

### 1. Backend Setup
```bash
# Navigate to project root
cd /path/to/cps_project

# Create Python virtual environment
python3 -m venv backend/venv

# Activate virtual environment
source backend/venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r backend/requirements.txt

# Seed synthetic smart laboratory database
PYTHONPATH=backend python backend/app/core/seed.py

# Start FastAPI backend server (port 8000)
PYTHONPATH=backend uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*Backend Swagger API docs available at: `http://127.0.0.1:8000/docs`*

### 2. Frontend Setup
In a new terminal window:
```bash
cd /path/to/cps_project/frontend

# Install npm packages
npm install

# Start Vite development server (port 5173)
npm run dev -- --host 127.0.0.1 --port 5173
```
*Frontend web application available at: `http://127.0.0.1:5173/`*

---

## 🔑 Development Demo Credentials

For rapid testing and instructor evaluation, the login page features **1-click quick login pill buttons** for all four lab roles:

| Role | Email Address | Password | Permissions & Laboratory Scope |
|---|---|---|---|
| **Administrator** | `admin@lab.edu` | `Admin@123456` | Full privileges: policy management, user role updates, quarantine control, device creation |
| **Researcher** | `researcher@lab.edu` | `Research@123456` | Authorized for AI Compute Clusters, Research Servers, Workstations, 3D Printers |
| **Technician** | `technician@lab.edu` | `Tech@123456` | Authorized for IoT Sensors, Additive Hardware, Access Doors, Workstations |
| **Student** | `student@lab.edu` | `Student@123456` | Standard role: Workstations and 3D Printers (restricted from HPC servers and databases) |

---

## 🧪 Running Automated Tests

Run the backend pytest test suite to verify authentication, zero-trust rules, differential privacy calculations, ML metrics, and CSV exports:

```bash
PYTHONPATH=backend ./backend/venv/bin/pytest backend/tests/test_backend.py -v
```

**Test Coverage Summary:**
- ✅ `test_health_and_root`: Microservice health check
- ✅ `test_admin_login_and_token`: JWT token generation & role validation
- ✅ `test_login_invalid_password`: Secure authentication rejection
- ✅ `test_safe_registration_no_admin_escalation`: Prevents privilege escalation during self-registration
- ✅ `test_pseudonym_generation_reproducibility`: Verifies HMAC-SHA256 deterministic tokenization
- ✅ `test_risk_adaptive_access_control`: Verifies permission precedence, risk tiers, and denial triggers
- ✅ `test_privacy_simulation_engine`: Verifies Laplace noise calibration and accuracy decay bounds
- ✅ `test_ai_threat_detection_model`: Verifies scikit-learn 2x2 confusion matrix and classification metrics
- ✅ `test_attack_simulation_and_containment`: Verifies kill-chain progression and digital twin quarantine
- ✅ `test_csv_exports`: Validates RFC 4180 CSV export endpoints for logs and privacy reports

---

## 🎓 College Presentation Demonstration Guide

Follow this walkthrough to showcase the core innovations during an MSc / college project demonstration:

### Innovation 1: Risk-Adaptive Zero-Trust Access Control (Page 4)
1. Log in as **Dr. Smith (Administrator)**.
2. Navigate to **Access Control**.
3. Point out the **3 Risk Decision Cards**:
   - `0–29 Low Risk`: Allow Access (green)
   - `30–69 Medium Risk`: Extra Verification / MFA (amber)
   - `70–100 High Risk`: Deny / Restrict + Alert (red)
4. Click on the **Decision Engine Simulator** tab:
   - Select **Role**: `Student` and **Resource**: `Database`. Click **Evaluate Real-Time Decision**.
   - *Demonstration Point*: Observe that access is **Denied** with reason *"Permission Denied"*, proving that **permission checks strictly take priority over risk scores** (Zero-Trust baseline).
   - Select **Role**: `Administrator` and **Resource**: `Lab PC-01` with risk modifier `+50`. Observe the step-up challenge to **Extra Verification**, showing risk-adaptive dynamic friction.

### Innovation 2: Cybersecurity Digital Twin (Page 5)
1. Navigate to **Digital Twin**.
2. View the **3D View**:
   - Showcase the 3D isometric cutaway model of the laboratory featuring **Room A: Workstations**, **Room B: 3D Printing**, **Server Room**, and **IoT Smart Door**.
   - Point out the live status pins: `Lab PC-01` (Online - green), `Lab PC-02` (Warning - amber), `Lab PC-03` (High Risk - red).
3. Click on **Lab PC-03** to open the telemetry drawer:
   - Point out the IP, MAC, risk score (85/100), and hardware telemetry.
   - Click **Quarantine Device**: observe that the device is instantly isolated, status updates to `Offline`, and network communication is severed.
4. Toggle to the **2D View** to demonstrate the architectural subnet layout and logical perimeter boundaries.

### Innovation 3: Defensive Attack Simulation & Kill-Chain Containment (Page 6)
1. Navigate to **Attack Simulation**.
2. Select the scenario **"Compromised Lab PC (Lateral Movement)"** and click **Run Simulation**.
3. Showcase the **Attack Topology Graph**:
   - Central node **Lab PC-03** glowing red as `Compromised`.
   - Directed attack vectors spreading to **Lab PC-01**, **Server**, and **Database** (`At Risk` in orange).
   - Egress path to **Smart Door** marked as `Blocked` (gray/blue).
4. Review the **MITRE ATT&CK kill-chain steps** (T1204.002 Macro Execution $\to$ T1046 Port Scanning $\to$ T1003.001 LSASS Credential Dumping $\to$ D3-NDP Adaptive Defense).
5. Click **Deploy Quarantine Isolation**:
   - Observe immediate defensive containment neutralizing lateral propagation.

### Innovation 4: Intelligent AI Threat Detection (Page 7)
1. Navigate to **Threat Detection**.
2. Point out the **Scikit-Learn Evaluation Metrics**:
   - Real calculated metrics: **Accuracy (~94%)**, **Precision (~88%)**, **Recall (~84%)**, **F1-Score (~86%)**.
   - Live **2x2 Confusion Matrix** displaying True Negatives, False Positives, False Negatives, and True Positives from actual validation experiments.
3. Review the **Threat Activity (Last 24 Hours)** line chart and **Threat Categories** donut distribution.
4. Test the **Live Telemetry Anomaly Inference** tool:
   - Adjust packet rate slider to `4500 packets/sec` and unusual port ratio to `80%`.
   - Click **Score Event Vector**: observe real-time Isolation Forest scoring flagging the vector as `⚠ Anomalous Threat` with risk score > 80.

### Innovation 5: Privacy-Preserving Access Control Simulation (Page 8)
1. Navigate to **Privacy Simulation**.
2. This is the **flagship innovation** of the project:
   - Select **Privacy Method**: `Differential Privacy (Laplace Mechanism)`.
   - Adjust the **Epsilon ($\varepsilon$) Slider** between `0.1` and `5.0`.
   - Click **Run Privacy Simulation**.
3. Explain the dynamically calculated results:
   - **Identification Risk**: Reduced from ~14.8% down to ~2.1% (~85% re-identification vulnerability mitigation).
   - **Model Accuracy**: Retains high utility (~92.8% vs 95.4% baseline).
   - **Pareto Trade-Off Curve**: Recharts dual-line visualization proving the theoretical relationship between privacy parameter $\varepsilon$ and model utility.
4. Inspect the **Sample Access Decisions Table**:
   - Point out that raw personal emails and names are replaced with deterministic salted HMAC pseudonyms (`U_A7F5E2`).
5. Click **Export CSV** and **Export JSON** to demonstrate downloadable experimental reporting.

---

## ☁️ Cloud Deployment (Supabase, GitHub & Vercel)

### 1. Supabase PostgreSQL Setup
1. Create a free account at [supabase.com](https://supabase.com) and create a new project.
2. In Supabase Dashboard, go to **Project Settings** -> **Database**.
3. Under **Connection string**, select **URI** (Mode: Transaction pooler, port 6543, or Session pooler, port 5432).
4. Copy the connection URI:
   ```env
   DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
   ```
5. Test and prime the Supabase database with all tables and seed data:
   ```bash
   DATABASE_URL="<your-supabase-uri>" python backend/test_supabase.py
   ```

### 2. Push to GitHub
1. Initialize git and commit:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: CyberShield full-stack application"
   ```
2. Create repository and push via GitHub CLI (`gh`):
   ```bash
   gh repo create cybershield --public --source=. --remote=origin --push
   ```
   *(Or push to an existing remote: `git remote add origin <url> && git push -u origin main`)*

### 3. Deploy to Vercel
1. Log in to [vercel.com](https://vercel.com) and click **"Add New Project"**.
2. Select your `cybershield` GitHub repository.
3. Configure settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (or `frontend` if deploying frontend alone)
   - **Build Command**: `npm --prefix frontend run build`
   - **Output Directory**: `frontend/dist`
   - **Environment Variables**:
     - `VITE_API_URL`: Your hosted FastAPI backend URL (e.g. on Render/Railway)
4. Click **Deploy**. Vercel will build and assign an instant HTTPS live link.

---

## 🔒 Privacy & Security Academic Notes

1. **Differential Privacy Guarantee Scope**: The Laplace mechanism $Laplace(0, \Delta f / \varepsilon)$ is applied to bounded risk score aggregation queries ($\Delta f = 1.0$). In strict compliance with academic honesty, Differential Privacy guarantees are not claimed for raw log strings; raw identifiers undergo cryptographic HMAC pseudonymization.
2. **Pseudonymisation Limitation**: Pseudonymisation provides tokenization of direct identifiers but does not equate to full anonymization if auxiliary quasi-identifiers are present.
3. **Synthetic Baseline**: All training telemetry and device states are synthetically generated to model realistic smart laboratory conditions without compromising proprietary external systems.

---

## 📄 License

Developed for academic demonstration and research purposes under the MIT License.
