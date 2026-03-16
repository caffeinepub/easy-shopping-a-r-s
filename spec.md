# Easy Shopping A.R.S

## Current State
The app has buyer accounts with Internet Identity-based auth. The backend has a `UserProfile` type with `name`, `email`, and `address` fields, and save/get profile functions. The frontend does not yet have a profile management UI.

## Requested Changes (Diff)

### Add
- `phone` field to `UserProfile` in backend (Nepal mobile number, 10 digits starting with 98/97/96)
- A "My Profile" page in the frontend where buyers can view and save: Name, Address, Phone number
- Route `/profile` in the frontend router
- Link to profile from header (for logged-in buyers)
- Nepal phone number validation on the frontend (must start with 98, 97, or 96 and be exactly 10 digits)

### Modify
- `UserProfile` type: add `phone: Text` field
- `saveCallerUserProfile` accepts updated profile with phone
- Header component: add "My Profile" nav link for buyers

### Remove
- Nothing

## Implementation Plan
1. Update `UserProfile` type in `main.mo` to include `phone: Text`
2. Create `ProfilePage.tsx` with form fields: Name, Address, Phone (Nepal validation)
3. Add `/profile` route in `App.tsx`
4. Add profile link in `Header.tsx` for buyers
5. Add `useUserProfile` and `useSaveUserProfile` hooks in `useQueries.ts`
