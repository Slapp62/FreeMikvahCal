# Edit/Delete Calendar Events - Implementation Specification

## Overview
This document specifies the implementation of edit/delete functionality for calendar events with specific dependency rules.

## Dependency Rules

### Period Start → Vestos
- Editing period date RECALCULATES all vestos for this and future periods
- Deleting period REMOVES all vestos, bedikot (current behavior - no changes)

### Hefsek/Bedikot → Mikvah
- Editing hefsek date AUTO-RECALCULATES mikvah date (hefsek + 7 days)
- Deleting hefsek DELETES all bedikot and mikvah date
- Editing/deleting bedikot does NOT affect vestos

### Independent Events
- Bedikot and Hefsek are INDEPENDENT of vestos
- No recalculation of vestos when hefsek/bedikot change

---

## Backend Implementation

### 1. updatePeriodStart(userId, cycleId, periodStartData)

**Location**: `backend/src/features/cycle-tracking/cycle.service.js` (after recalculateAllPeriodVestOnot)

**Purpose**: Edit period start date while retaining all period data (hefsek, bedikot, mikvah)

**Parameters**:
```javascript
{
  startTime: Date (ISO string),
  endTime: Date (ISO string)
}
```

**Logic**:
1. Find period by cycleId and userId
2. Update `niddahOnah.start` and `niddahOnah.end`
3. Recalculate this period's vestos using `calculateAllVestOnot()`
4. Find all future periods (periods after this one)
5. For each future period:
   - Recalculate haflagah based on new period start
   - Recalculate all vestos
6. Return `{ period, futurePeriodsUpdated: count }`

**Database Operations**:
- UPDATE: period.niddahOnah
- UPDATE: vestos for current period
- UPDATE: haflagah and vestos for all future periods

---

### 2. updateHefsek(userId, cycleId, hefsekData)

**Location**: `backend/src/features/cycle-tracking/cycle.service.js`

**Purpose**: Edit hefsek date and auto-recalculate mikvah

**Parameters**:
```javascript
{
  dateString: "2026-02-10",
  timeString: "18:30"
}
```

**Logic**:
1. Find period by cycleId and userId
2. Convert to UTC using user's timezone
3. Update `hefsekTaharaDate`
4. Calculate `shivaNekiyimStartDate = hefsek + 1 day`
5. Calculate `mikvahDate = shivaNekiyim + 6 days`
6. Update status to 'shiva_nekiyim' if not already
7. Do NOT recalculate vestos
8. Return updated period

**Database Operations**:
- UPDATE: period.hefsekTaharaDate, shivaNekiyimStartDate, mikvahDate, status

---

### 3. deleteHefsek(userId, cycleId)

**Location**: `backend/src/features/cycle-tracking/cycle.service.js`

**Purpose**: Delete hefsek, all bedikot, and mikvah date

**Logic**:
1. Find period by cycleId and userId
2. Delete ALL bedikot for this period: `Bedikahs.deleteMany({ periodId: cycleId, userId })`
3. Clear hefsek dates:
   - `hefsekTaharaDate = null`
   - `shivaNekiyimStartDate = null`
   - `mikvahDate = null`
4. Clear voiding info: `periodVoidedInfo.isVoided = false`
5. Revert status to 'niddah'
6. Do NOT recalculate vestos
7. Return `{ period, bedikotDeleted: count }`

**Database Operations**:
- DELETE: All bedikot for this period
- UPDATE: period (clear hefsek dates, status = 'niddah')

---

### 4. updateBedikah(userId, cycleId, bedikahId, bedikahData)

**Location**: `backend/src/features/cycle-tracking/cycle.service.js`

**Purpose**: Edit bedikah details (date, time, results)

**Parameters**:
```javascript
{
  date: { dateString, timeString },
  dayNumber: 1-7,
  timeOfDay: 'morning' | 'evening' | 'both',
  results: {
    morning: 'clean' | 'questionable' | 'not_clean',
    evening: 'clean' | 'questionable' | 'not_clean'
  },
  notes: string
}
```

**Logic**:
1. Find bedikah by bedikahId, periodId, userId
2. Find associated period
3. Check if result is changing to/from 'not_clean':
   - If changing TO 'not_clean': Void hefsek (store in periodVoidedInfo)
   - If changing FROM 'not_clean': Keep hefsek voided (user requirement)
4. Update bedikah record
5. Recalculate mikvah if hefsek status changed
6. Do NOT recalculate vestos
7. Return updated bedikah

**Database Operations**:
- UPDATE: bedikah record
- UPDATE: period (if voiding hefsek)

---

### 5. deleteBedikah(userId, cycleId, bedikahId)

**Location**: `backend/src/features/cycle-tracking/cycle.service.js`

**Purpose**: Delete single bedikah (keep hefsek voided per user requirement)

**Logic**:
1. Find bedikah by bedikahId, periodId, userId
2. Delete bedikah record
3. Do NOT restore hefsek (even if this bedikah voided it - user requirement)
4. Do NOT recalculate vestos
5. Return `{ success: true, bedikahId }`

**Database Operations**:
- DELETE: bedikah record

---

## Backend Routes

### File: `backend/src/features/cycle-tracking/cycle.routes.js`

Add routes:
```javascript
// Period start
router.put('/:id/period-start', requireAuth, updatePeriodStartController);

// Hefsek
router.put('/:id/hefsek', requireAuth, updateHefsekController);
router.delete('/:id/hefsek', requireAuth, deleteHefsekController);

// Bedikah
router.put('/:id/bedikot/:bedikahId', requireAuth, updateBedikahController);
router.delete('/:id/bedikot/:bedikahId', requireAuth, deleteBedikahController);
```

---

## Backend Controllers

### File: `backend/src/features/cycle-tracking/cycle.controller.js`

Add controller methods for each new route (5 total).

---

## Frontend Implementation

### 1. EditPeriodStartForm Component

**File**: `frontend/src/components/forms/EditPeriodStartForm.tsx`

**Props**:
```typescript
{
  cycleId: string;
  currentNiddahOnah: { start: string, end: string };
  close: () => void;
}
```

**Features**:
- Show current period start date and onah
- Allow changing to day or night onah
- Date picker for new date
- Time calculated automatically based on zmanim
- Show warning: "This will recalculate vestos for this and future periods"
- Confirmation modal before submitting

**Submission**:
- Calls API: `PUT /api/cycles/:id/period-start`
- Shows success with count of recalculated periods
- Triggers calendar refetch

---

### 2. EditHefsekForm Component

**File**: `frontend/src/components/forms/EditHefsekForm.tsx`

**Props**:
```typescript
{
  cycleId: string;
  currentHefsekDate: string;
  close: () => void;
}
```

**Features**:
- Show current hefsek date
- Date and time picker
- Calculate and show new mikvah date preview
- Info message: "Mikvah will be recalculated to [new date]"
- No confirmation needed (non-destructive)

**Submission**:
- Calls API: `PUT /api/cycles/:id/hefsek`
- Shows success with new mikvah date
- Triggers calendar refetch

---

### 3. EditBedikahForm Component

**File**: `frontend/src/components/forms/EditBedikahForm.tsx`

**Props**:
```typescript
{
  cycleId: string;
  bedikahId: string;
  currentBedikah: Bedikah;
  close: () => void;
}
```

**Features**:
- Show all current bedikah details
- Allow editing: date, time, dayNumber, timeOfDay, results, notes
- If changing result to 'not_clean', show warning about voiding hefsek
- No confirmation needed for normal edits
- Confirmation modal if changing to 'not_clean'

**Submission**:
- Calls API: `PUT /api/cycles/:id/bedikot/:bedikahId`
- Shows success
- Triggers calendar refetch

---

### 4. Update EditEventModal

**File**: `frontend/src/pages/editCalEvent.modal.tsx` (or similar)

**Changes**:
- Detect event type from classNames or title
- Route to appropriate form/action:
  - Period Start → Show: Edit Date button, Delete Period button
  - Hefsek → Show: Edit Date button, Delete Hefsek button (with confirmation)
  - Bedikah → Show: Edit Details button, Delete Bedikah button (with confirmation)
  - Mikvah → Show: Read-only info, "Edit hefsek to change" message
  - Vestos → Show: Read-only info, "Edit period start to recalculate" message

**Delete Confirmations**:
- Hefsek: "Delete hefsek? This will also delete all bedikot and the mikvah date."
- Bedikah: "Delete this bedikah?"
- Period: (already exists - no changes)

---

## Frontend API Functions

### File: `frontend/src/services/cycleApi.ts`

Add functions:
```typescript
export const updatePeriodStart = async (cycleId: string, data: PeriodStartData) => {
  const response = await axios.put(`/api/cycles/${cycleId}/period-start`, data);
  return response.data;
};

export const updateHefsek = async (cycleId: string, data: HefsekData) => {
  const response = await axios.put(`/api/cycles/${cycleId}/hefsek`, data);
  return response.data;
};

export const deleteHefsek = async (cycleId: string) => {
  const response = await axios.delete(`/api/cycles/${cycleId}/hefsek`);
  return response.data;
};

export const updateBedikah = async (cycleId: string, bedikahId: string, data: BedikahData) => {
  const response = await axios.put(`/api/cycles/${cycleId}/bedikot/${bedikahId}`, data);
  return response.data;
};

export const deleteBedikah = async (cycleId: string, bedikahId: string) => {
  const response = await axios.delete(`/api/cycles/${cycleId}/bedikot/${bedikahId}`);
  return response.data;
};
```

---

## Implementation Order

### Phase 1: Backend Foundation
1. Add 5 service functions to cycle.service.js
2. Add 5 controller methods to cycle.controller.js
3. Add 5 routes to cycle.routes.js
4. Add validation schemas
5. Test with Postman/curl

### Phase 2: Frontend Forms
6. Create EditPeriodStartForm.tsx
7. Create EditHefsekForm.tsx
8. Create EditBedikahForm.tsx
9. Add API functions to cycleApi.ts

### Phase 3: Integration
10. Update EditEventModal to route to forms
11. Add confirmation modals for delete operations
12. Test full flow end-to-end

---

## Testing Checklist

### Period Start Edit:
- [ ] Can change day period to night period
- [ ] Can change night period to day period
- [ ] Can change date
- [ ] Vestos recalculated for current period
- [ ] Vestos recalculated for all future periods
- [ ] Hefsek, bedikot, mikvah retained
- [ ] Success message shows count of recalculated periods

### Hefsek Edit:
- [ ] Can change hefsek date
- [ ] Can change hefsek time
- [ ] Mikvah date auto-updates (7 days after)
- [ ] Vestos NOT recalculated
- [ ] Bedikot retained

### Hefsek Delete:
- [ ] Confirmation modal appears
- [ ] Hefsek date cleared
- [ ] All bedikot deleted
- [ ] Mikvah date cleared
- [ ] Status reverted to 'niddah'
- [ ] Vestos NOT affected

### Bedikah Edit:
- [ ] Can change date, time, dayNumber
- [ ] Can change timeOfDay
- [ ] Can change results
- [ ] Changing to 'not_clean' voids hefsek
- [ ] Confirmation shown when voiding hefsek
- [ ] Vestos NOT recalculated

### Bedikah Delete:
- [ ] Confirmation modal appears
- [ ] Bedikah deleted
- [ ] Hefsek remains voided (if applicable)
- [ ] Vestos NOT affected

---

## Notes

- All timestamp conversions use user's timezone
- All vest recalculations use `calculateAllVestOnot()` from vest-calculator.service.js
- All operations require authentication (`requireAuth` middleware)
- All operations validate userId matches (no cross-user access)
- Logging: Use `logDatabase()` for all CRUD operations
- Error handling: Use `throwError()` for consistent error responses

---

## End of Specification
