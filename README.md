# StreamOS — Cloud-Based Video Streaming OS Algorithm Visualizer

A web application designed for Operating Systems mini-projects based on **Problem 7: Cloud-Based Video Streaming Platform**.

StreamOS simulates a cloud-based video streaming infrastructure where streaming sessions (such as 4K video transcoding, chunk fetching, audio decoding, metadata indexing, and DRM license verification) compete for CPU core time, bounded segment buffer capacity, shared node resources, and physical memory partitions.

---

## 1. Operating System Concepts & Algorithms Included

### Module A: CPU Scheduling
- **First-Come, First-Served (FCFS)**: Non-preemptive scheduling based on process arrival order. Demonstrates potential convoy effect.
- **Shortest Job First (SJF)**: Non-preemptive scheduling selecting the process with the shortest CPU burst time to minimize average waiting time.
- **Round Robin (RR)**: Preemptive scheduling allocating fixed time quanta ($Q$) per slice to ensure interactive streaming fairness.
- **Priority Scheduling (Preemptive & Non-Preemptive)**: Executes processes according to priority level (1 = highest priority).
- **Aging Mechanism**: Dynamic priority boosting over time for waiting processes to prevent **indefinite starvation**.

### Module B: Producer–Consumer Video Buffer
- **Bounded Buffer Model**: Represents a circular chunk buffer holding H.264/HEVC/AV1 streaming video segments.
- **Binary Semaphore (`mutex = 1`)**: Ensures mutual exclusion during buffer modification.
- **Counting Semaphores**:
  - `empty = N`: Tracks available free buffer slots. Blocks producer when `empty == 0` (buffer overflow protection).
  - `full = 0`: Tracks populated segment slots. Blocks consumer when `full == 0` (buffer underflow / playback stutter protection).

### Module C: Banker's Algorithm (Deadlock Avoidance)
- **Matrix Representation**:
  - Allocation Matrix: Current resources held by each process.
  - Maximum Matrix: Declared max claim per process.
  - Need Matrix: Calculated as $\text{Need}[i][j] = \text{Max}[i][j] - \text{Allocation}[i][j]$.
- **Safety Algorithm**: Finds a valid execution sequence $\langle P_0 \rightarrow P_1 \rightarrow \dots \rangle$ using a dynamic `Work` vector.
- **Resource Request Algorithm**: Simulates tentative allocation for incoming process requests and rolls back safely if an **UNSAFE** state is detected.

### Module D: Memory Management
- **Partition Placement Policies**:
  - **First Fit**: Allocates into the first partition large enough to satisfy request.
  - **Best Fit**: Allocates into the smallest suitable partition to minimize wasted space.
  - **Worst Fit**: Allocates into the largest available partition to leave maximum leftover chunk size.
- **Fragmentation Metrics**: Calculates Internal Fragmentation (unused RAM inside fixed partitions) and External Fragmentation (failed allocations due to non-contiguous free memory).

### Section 8: Integrated End-to-End Pipeline
- Connects all four OS modules into a unified streaming state machine:
  $$\text{Segment Ingestion} \rightarrow \text{Bounded Buffer} \rightarrow \text{Memory Allocation} \rightarrow \text{Banker Safety} \rightarrow \text{CPU Ready} \rightarrow \text{Execution}$$

---

## 2. Quick Start & Installation Commands

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation Commands
```bash
# Clone or navigate to project directory
cd /app/applet

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app runs on `http://localhost:3000`.

### Build & Production Command
```bash
# Create production build
npm run build

# Preview build locally
npm run preview
```

---

## 3. Sample Test Cases & Expected Results

### Test Case 1: CPU Scheduling (Round Robin vs SJF)
- **Inputs**:
  - P1: Arrival = 0s, Burst = 8s, Priority = 2
  - P2: Arrival = 1s, Burst = 4s, Priority = 1
  - P3: Arrival = 2s, Burst = 9s, Priority = 3
- **Expected Result**:
  - **FCFS**: P1 runs first (0-8s), P2 (8-12s), P3 (12-21s). Avg WT = 5.0s.
  - **SJF**: At t=8s, P2 (burst=4) runs before P3 (burst=9). Avg WT is lower than FCFS.
  - **Round Robin (Q=2)**: Interleaves execution slices: P1(0-2s) $\to$ P2(2-4s) $\to$ P3(4-6s) $\to$ P1(6-8s)...

### Test Case 2: Banker's Algorithm Safe State Verification
- **Resources**: $R_0 = 10, R_1 = 5, R_2 = 7$.
- **Available Vector**: $[3, 3, 2]$.
- **Expected Result**: Safety algorithm confirms **SAFE STATE** with execution order $\langle P_1 \rightarrow P_3 \rightarrow P_4 \rightarrow P_0 \rightarrow P_2 \rangle$.

### Test Case 3: Banker's Algorithm Unsafe Request Rejection
- **Action**: Process $P_1$ requests resource vector $[3, 2, 2]$.
- **Expected Result**: System detects that tentative allocation leaves Available $= [0, 1, 0]$, causing deadlock risk. Request is **REJECTED** and state is safely rolled back.

### Test Case 4: Memory Placement Policy (Best Fit vs Worst Fit)
- **Partitions**: $[128\text{MB}, 256\text{MB}, 64\text{MB}, 512\text{MB}, 200\text{MB}]$.
- **Process Request**: Process $P_3$ requests $45\text{MB}$.
- **Expected Result**:
  - **Best Fit**: Selects Partition M3 ($64\text{MB}$). Internal fragmentation $= 19\text{MB}$.
  - **Worst Fit**: Selects Partition M4 ($512\text{MB}$). Internal fragmentation $= 467\text{MB}$.

---

## 4. Mini-Project Demonstration & Viva Defense Guide

During your college presentation, showcase:
1. **Overview Dashboard**: Highlight the platform topology mapping cloud streaming features (transcoding, decoding, buffering) to OS primitives.
2. **CPU Gantt Chart Step Playback**: Press **Step +1s** or **Play** to demonstrate context switching, ready queue movements, and aging priority boosts.
3. **Producer–Consumer Buffer**: Demonstrate producer blocking by filling the buffer to capacity ($empty = 0$), then consuming segments to show unblocking.
4. **Banker's Safety Check**: Click **Test Unsafe Scenario** to demonstrate real-time deadlock detection and automatic request rejection.
5. **Integrated Pipeline**: Click **Auto-Run Engine** in the End-to-End view to demonstrate tasks flowing seamlessly through Buffer $\to$ Memory $\to$ Banker $\to$ CPU.
