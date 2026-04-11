# Friends System Setup Guide

This guide explains how to set up the friends system and movie recommendation restrictions for your MovieTrackingApp.

## Database Setup

Run the following SQL commands in your Supabase SQL editor to create the required tables:

```sql
-- Create friend_requests table
CREATE TABLE friend_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sender_id, receiver_id)
);

-- Create friendships table for accepted friendships
CREATE TABLE friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user1_id, user2_id),
  CHECK (user1_id < user2_id) -- Ensure consistent ordering to prevent duplicates
);

-- Add indexes for better performance
CREATE INDEX idx_friend_requests_sender ON friend_requests(sender_id);
CREATE INDEX idx_friend_requests_receiver ON friend_requests(receiver_id);
CREATE INDEX idx_friend_requests_status ON friend_requests(status);
CREATE INDEX idx_friendships_user1 ON friendships(user1_id);
CREATE INDEX idx_friendships_user2 ON friendships(user2_id);

-- Enable RLS (Row Level Security)
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Policies for friend_requests
CREATE POLICY "Users can view their own friend requests" ON friend_requests
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create friend requests" ON friend_requests
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received friend requests" ON friend_requests
  FOR UPDATE USING (auth.uid() = receiver_id);

-- Policies for friendships
CREATE POLICY "Users can view their friendships" ON friendships
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create friendships" ON friendships
  FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);
```

## Features Implemented

### 1. Add Friends Page (`/add-friends`)
- Accessible after user login/signup
- Displays all registered users (excluding current user)
- Search functionality to find users by name or email
- Friend request system with send/accept/reject functionality
- Real-time status updates (pending, accepted, rejected, friends)

### 2. Friends List Page (`/friends`)
- Shows all accepted friends
- Option to remove friends
- Clean, user-friendly interface

### 3. Restricted Movie Recommendations
- "Recommend Movie to a Friend" button now only shows friends
- Users cannot send recommendations to non-friends
- Updated UI text to reflect friend-only recommendations

### 4. Navigation Updates
- Added "Add Friends" and "Friends" links to navbar
- Active page highlighting for all navigation items
- Mobile-responsive navigation

## How It Works

1. **Friend Requests**: Users can send friend requests from the Add Friends page
2. **Accept/Reject**: Recipients can accept or reject requests
3. **Friendships**: Accepted requests create bidirectional friendships
4. **Recommendations**: Only friends appear in the recommendation modal
5. **Real-time Updates**: All changes are reflected immediately

## Security

- Row Level Security (RLS) policies ensure users can only see their own friend data
- Friendships are bidirectional and prevent duplicate entries
- All database operations are properly validated

## Testing

1. Create multiple user accounts
2. Test sending friend requests between users
3. Test accepting/rejecting requests
4. Verify that only friends appear in movie recommendations
5. Test removing friends functionality

The friends system is now fully integrated with your existing MovieTrackingApp!