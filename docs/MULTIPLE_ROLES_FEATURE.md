# Multiple Roles Feature

## Overview

This feature adds support for users to have multiple roles simultaneously. For example, a user can be both an `admin` and a `facilitator`, allowing them to have combined permissions and appear in appropriate sections of the platform.

## What's New

### Database Changes
- Added `roles` array column to the `profiles` table
- Migrated existing `role` data to the new `roles` array
- Updated RLS policies to check roles using array operators
- Added helper functions for role checking
- Kept the single `role` field for backward compatibility

### Frontend Changes

#### 1. Members Page
- **Featured Facilitators Section**: A dedicated "Meet Your Facilitators" section at the top
- Shows all users with the `facilitator` role
- Enhanced cards with golden borders for facilitators
- Displays employer and current role information
- Separates facilitators from regular participants

#### 2. Role Badge Component
- Now supports displaying multiple role badges
- Accepts both `role` (single, deprecated) and `roles` (array) props
- Automatically prioritizes roles: Admin > Facilitator > Participant
- Displays badges side-by-side when user has multiple roles

#### 3. Admin User Management
- Updated Edit Role Modal to use checkboxes instead of dropdown
- Admins can now assign multiple roles to any user
- Shows clear descriptions for each role
- Validates that users must have at least one role
- Visual feedback when roles are changed

#### 4. TypeScript Types
- Updated `User` and `UserProfile` interfaces to include `roles: UserRole[]`
- Kept `role` field for backward compatibility
- All queries now fetch both `role` and `roles`

### API Changes

#### New Functions
- `updateUserRoles(userId, roles[])` - Update a user's roles (supports multiple)
- `getFacilitators()` - Get all users with facilitator role
- `user_has_role(user_id, role)` - Database helper function
- `user_has_any_role(user_id, roles[])` - Database helper function

#### Updated Functions
- `updateUserRole()` - Now also updates the roles array (deprecated, use updateUserRoles)
- All member queries now return the `roles` field

## Migration

### Step 1: Apply the Database Migration

Run the migration to add multiple roles support:

```bash
# Using Supabase CLI
supabase migration up

# Or apply directly to your database
# Execute: supabase/migrations/00051_multiple_roles.sql
```

### Step 2: Verify the Migration

After applying the migration:

1. Check that all users have a `roles` array:
```sql
SELECT id, email, role, roles FROM profiles LIMIT 10;
```

2. Verify RLS policies are working:
```sql
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

### Step 3: Assign Multiple Roles

To give yourself both admin and facilitator roles:

1. Go to Admin > Users
2. Find your profile
3. Click the three dots menu > Edit Role
4. Check both "Admin" and "Facilitator"
5. Click "Update Roles"

You should now see both badges next to your name!

## Usage Examples

### Checking User Roles in Code

```typescript
// Check if user has a specific role
const isFacilitator = user.roles?.includes('facilitator')

// Check if user has any admin privileges
const isAdmin = user.roles?.includes('admin') || user.role === 'admin'

// Check multiple roles
const canModerate = user.roles?.some(r => ['admin', 'facilitator'].includes(r))
```

### Database Queries

```sql
-- Find all facilitators
SELECT * FROM profiles WHERE 'facilitator' = ANY(roles);

-- Find users with multiple roles
SELECT * FROM profiles WHERE array_length(roles, 1) > 1;

-- Find admins who are also facilitators
SELECT * FROM profiles 
WHERE roles @> ARRAY['admin', 'facilitator']::TEXT[];
```

### Using Helper Functions

```sql
-- Check if user has admin role
SELECT user_has_role('user-uuid-here', 'admin');

-- Check if user has admin OR facilitator role
SELECT user_has_any_role('user-uuid-here', ARRAY['admin', 'facilitator']);
```

## Benefits

1. **Flexibility**: Users can have multiple responsibilities without conflicting permissions
2. **Better UX**: Facilitators are prominently featured on the Members page
3. **Accurate Representation**: Users like yourself who are both admin and facilitator are properly represented
4. **Backward Compatible**: The single `role` field is maintained for legacy code
5. **Future-Proof**: Easy to add new roles or role combinations

## UI/UX Improvements

### Members Page
- Clear visual separation between facilitators and participants
- Sparkles icon and gold accents highlight facilitators
- Larger avatars for facilitators (24 vs 20)
- Featured section with description
- Shows professional information (employer, current role)

### Admin Interface
- Intuitive checkbox-based role selection
- Real-time validation (must have at least one role)
- Clear role descriptions with color coding
- Warning when making changes
- Shows count when multiple roles are assigned

## Testing

### Test Scenarios

1. **Single Role User**
   - Create a user with only "Participant" role
   - Verify they appear only in the participants section

2. **Multiple Role User**
   - Assign a user both "Admin" and "Facilitator" roles
   - Verify both badges appear
   - Verify they appear in the facilitators section
   - Verify they have admin permissions

3. **Role Filtering**
   - Go to Admin > Users
   - Filter by "Facilitator"
   - Verify users with facilitator role appear (even if they have other roles too)

4. **Migration Verification**
   - Check existing users have proper roles array
   - Verify no users lost their role during migration

## Troubleshooting

### Issue: User doesn't appear in Facilitators section
- Check that `roles` array includes 'facilitator'
- Verify the migration was applied successfully
- Clear browser cache and reload

### Issue: Can't select multiple roles in admin panel
- Ensure the migration was applied
- Check browser console for errors
- Verify you're using the latest code

### Issue: RLS policies blocking access
- Run: `SELECT * FROM profiles WHERE id = auth.uid()`
- Verify your user has the expected roles array
- Check that RLS policies were updated in migration

## Future Enhancements

Potential improvements for future iterations:

1. **Role Hierarchy**: Implement automatic inheritance (e.g., admin includes facilitator permissions)
2. **Custom Permissions**: Fine-grained permissions beyond role-based
3. **Role History**: Track when roles were added/removed
4. **Bulk Role Assignment**: Assign roles to multiple users at once
5. **Role Templates**: Pre-defined role combinations for common use cases

## Related Files

### Database
- `supabase/migrations/00051_multiple_roles.sql` - Migration file

### Backend
- `lib/supabase/queries/users.ts` - User management queries
- `lib/supabase/queries/social.ts` - Social/member queries

### Frontend
- `app/(dashboard)/members/page.tsx` - Members page with facilitators section
- `app/(dashboard)/admin/users/page.tsx` - Admin user management
- `components/admin/edit-role-modal.tsx` - Multi-role editor
- `components/ui/role-badge.tsx` - Role display component

### Types
- `types/index.types.ts` - TypeScript type definitions

## Support

For issues or questions about this feature, check:
1. Database migration was applied successfully
2. Browser console for any errors
3. Supabase logs for RLS policy issues
4. This documentation for usage examples

