# Events Management Feature

## Overview
Complete events management system for scheduling and managing cohort calls, workshops, book clubs, and office hours. Supports virtual, in-person, and hybrid event formats with comprehensive scheduling and attendance tracking.

## Features Implemented

### 1. Database Schema Enhancement
**File:** `supabase/migrations/00016_enhance_events_schema.sql`

Added new columns to the events table:
- `is_required` - Boolean flag for required vs optional attendance
- `location_type` - Enum: 'virtual', 'in_person', 'hybrid'
- `location_address` - Physical address for in-person/hybrid events
- `module_id` - Optional association with a specific module

### 2. Type Definitions
**File:** `types/index.types.ts`

Updated Event interface with:
- `LocationType` type
- All new fields in Event interface
- Proper TypeScript typing throughout

### 3. Constants
**File:** `lib/constants/index.ts`

Added `LOCATION_TYPES` constant:
- Virtual (Online) 💻
- In-Person 📍
- Hybrid 🔗

### 4. Event Form Component
**File:** `components/events/event-form.tsx`

Comprehensive form for creating/editing events with:
- **Basic Information:**
  - Title (required)
  - Description
  - Event type (cohort call, workshop, book club, office hours)
  - Module association (optional)

- **Schedule:**
  - Start date & time (required)
  - End date & time (required)
  - Required/Optional toggle

- **Location:**
  - Location type selector (virtual, in-person, hybrid)
  - Conditional fields based on location type:
    - Physical address (for in-person/hybrid)
    - Zoom link (for virtual/hybrid)
    - Zoom meeting ID (optional)

- **Capacity:**
  - Max attendees (optional)

**Validation:**
- End time must be after start time
- Zoom link required for virtual/hybrid events
- Physical address required for in-person/hybrid events

### 5. Admin Pages

#### Events List Page
**File:** `app/(dashboard)/admin/events/page.tsx`

Features:
- View all events with complete details
- Status badges:
  - Event type
  - Required/Optional
  - Location type
  - Module association
  - Past event indicator
- Event information display:
  - Date and time
  - Attendee count vs max capacity
  - Location details based on type
  - Hybrid events show both physical and virtual options
- Actions:
  - Edit event
  - Delete event (with confirmation dialog)
  - Create new event button

#### New Event Page
**File:** `app/(dashboard)/admin/events/new/page.tsx`

Simple page wrapping the EventForm component for creating new events.

#### Edit Event Page
**File:** `app/(dashboard)/admin/events/[id]/page.tsx`

Loads existing event data and passes it to EventForm for editing.

### 6. User Calendar View
**File:** `app/(dashboard)/calendar/page.tsx`

Enhanced calendar view showing:
- **Event Badges:**
  - Event type with color coding
  - Required/Optional indicator
  - Location type icon
  - Module association
  - Capacity status (Full)

- **Location Display:**
  - Virtual events: Show "Virtual event via Zoom"
  - In-person events: Display physical address
  - Hybrid events: Show both options clearly

- **Registration:**
  - Register/Unregister button
  - Capacity enforcement
  - Join Zoom button for registered virtual events

- **Event Information:**
  - Date and time
  - Attendee count with capacity
  - Module association if applicable

## Event Types

### Virtual Events
- Requires Zoom link
- Users can join directly from the platform
- "Join Zoom" button visible to registered users

### In-Person Events
- Requires physical location address
- Address displayed prominently on event card
- No Zoom integration

### Hybrid Events
- Requires both Zoom link AND physical address
- Users can choose their format
- Both options displayed clearly
- Provides flexibility for participants

## Module Association

Events can optionally be associated with a specific module:
- Helps organize events by curriculum content
- Displays module number and title on event cards
- Useful for module-specific workshops or cohort calls

## Attendance Tracking

The existing attendance system works with all event types:
- Users register for events
- Capacity limits enforced (if set)
- Admins can mark attendance
- Registration required to access Zoom links

## Required vs Optional Events

Clear indication of whether attendance is mandatory:
- Required events: Red badge with alert icon
- Optional events: Gray badge with checkmark icon
- Helps participants prioritize their schedule

## Future Enhancements

### Zoom Embedding
- Embed Zoom calls directly in the platform
- Requires Zoom SDK integration
- Would eliminate need to open Zoom in separate window

### Calendar Integration
- iCal/Google Calendar exports
- Automatic calendar sync
- Reminder emails

### Attendance Check-in
- QR code check-in for in-person events
- Virtual check-in for online events
- Real-time attendance dashboard

### Recurring Events
- Set up repeating weekly cohort calls
- Automatic event creation based on schedule
- Series management

## Usage

### For Admins/Facilitators:

1. **Create an Event:**
   - Navigate to Admin > Events
   - Click "Create Event"
   - Fill in all required fields
   - Select appropriate location type
   - Save event

2. **Edit an Event:**
   - Go to Admin > Events
   - Click edit icon on event card
   - Update fields as needed
   - Save changes

3. **Delete an Event:**
   - Go to Admin > Events
   - Click delete icon
   - Confirm deletion

### For Participants:

1. **View Events:**
   - Navigate to Events (Calendar) from sidebar
   - See all upcoming events

2. **Register for Event:**
   - Click "Register" button
   - For hybrid events, choose format later

3. **Join Virtual Event:**
   - Click "Join Zoom" button (visible to registered users)
   - Opens Zoom meeting in new tab

4. **Find In-Person Event:**
   - Physical address displayed on event card
   - Copy/use for navigation

## Migration Instructions

To apply the database changes:

```bash
# If using Supabase CLI locally
supabase db reset

# Or push to remote
supabase db push

# Or apply migration manually
psql -d your_database < supabase/migrations/00016_enhance_events_schema.sql
```

## Testing Checklist

- [ ] Create virtual event with Zoom link
- [ ] Create in-person event with address
- [ ] Create hybrid event with both
- [ ] Associate event with module
- [ ] Set capacity limit and test enforcement
- [ ] Mark event as required
- [ ] Register for event as participant
- [ ] Join Zoom from participant view
- [ ] Edit existing event
- [ ] Delete event (verify confirmation)
- [ ] Test validation (end time before start, missing required fields)
- [ ] Verify mobile responsiveness

## Files Modified

- `supabase/migrations/00016_enhance_events_schema.sql` (new)
- `types/index.types.ts`
- `lib/constants/index.ts`
- `lib/supabase/queries/events.ts`
- `components/events/event-form.tsx` (new)
- `app/(dashboard)/admin/events/page.tsx` (new)
- `app/(dashboard)/admin/events/new/page.tsx` (new)
- `app/(dashboard)/admin/events/[id]/page.tsx` (new)
- `app/(dashboard)/calendar/page.tsx`

## Design Consistency

All components follow the Rogue design system:
- Nature-inspired color palette
- Glass-morphism effects
- Consistent spacing and typography
- Proper use of existing UI components
- Accessible and keyboard-navigable
- Responsive design for all screen sizes

## Security

- RLS policies already in place from original schema
- Admins/facilitators can create/edit/delete events
- All users can view events
- Users can manage their own registration
- Protected admin routes check user role

## Notes

- Events are ordered by start_time ascending by default
- Past events are clearly marked but remain visible
- No automatic cleanup of old events (admin decision)
- Capacity is soft limit (admins can override if needed)
- Module association is purely organizational (not enforced)




