'use client'; // This directive is crucial as this file uses client-side hooks

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

// Import your separated components
import MessageBox from './Components/MessageBox';
import ParentDashboard from './Components/ParentDashboard';
import OnBoarding from './Components/OnBoarding';
import RoleSelection from './Components/RoleSelection';
import ChildDashboard from './Components/ChildDashboard';

// Main application component
export default function Home() {
  const [supabase, setSupabase] = useState(null);
  const [userId, setUserId] = useState(null); // This is Supabase's auth.uid()
  const [userRole, setUserRole] = useState(null); // 'parent' or 'child'
  const [userFamilyId, setUserFamilyId] = useState(null); // bigint ID of the family
  const [loadingApp, setLoadingApp] = useState(true);
  const [message, setMessage] = useState(null);

  // --- Supabase Initialization and Auth Listener ---
  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Supabase URL or Anon Key is missing. Please check your .env.local file.");
      setMessage({ text: "App configuration error. Missing Supabase keys.", type: "error" });
      setLoadingApp(false);
      return;
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    setSupabase(supabaseClient);

    // Supabase Auth State Change Listener
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if (session && session.user) {
        setUserId(session.user.id);
      } else {
        // Try to sign in anonymously if no user is authenticated
        try {
          const { data, error } = await supabaseClient.auth.signInAnonymously();
          if (error) throw error;
          if (data.user) {
            setUserId(data.user.id);
          }
        } catch (anonError) {
          console.error("Error signing in anonymously:", anonError.message);
          setMessage({ text: "Failed to sign in anonymously. " + anonError.message, type: "error" });
          setUserId(crypto.randomUUID()); // Fallback to a random ID if anonymous sign-in fails
        }
      }
    });

    return () => {
      if (authListener) authListener.unsubscribe(); // Cleanup auth listener
    };
  }, []); // Run only once on component mount

  // --- Fetch User Role and Family ID based on userId (auth.uid()) ---
  useEffect(() => {
    if (!supabase || !userId) return; // Wait for supabase client and userId to be ready

    const fetchUserRoleAndFamily = async () => {
      setLoadingApp(true); // Start loading when fetching profile

      try {
        // Check if user is a parent
        const { data: parentData, error: parentError } = await supabase
          .from('parents')
          .select('id, name') // Select parent's bigint ID and name
          .eq('auth_uid', userId)
          .single();

        if (parentError && parentError.code !== 'PGRST116') throw parentError;

        if (parentData) {
          setUserRole('parent');
          // Find family associated with this parent's auth_uid
          const { data: familyData, error: familyError } = await supabase
            .from('families')
            .select('id')
            .eq('parent_auth_uid', userId)
            .single();

          if (familyError && familyError.code !== 'PGRST116') throw familyError;
          setUserFamilyId(familyData ? familyData.id : null);
          setLoadingApp(false);
          return;
        }

        // If not a parent, check if user is a child
        const { data: childData, error: childError } = await supabase
          .from('children')
          .select('id, name, family_id, xp_balance') // Select child's bigint ID, name, family_id, xp_balance
          .eq('auth_uid', userId)
          .single();

        if (childError && childError.code !== 'PGRST116') throw childError;

        if (childData) {
          setUserRole('child');
          setUserFamilyId(childData.family_id);
          setLoadingApp(false);
          return;
        }

        // If user is neither parent nor child, they need to select a role
        setUserRole(null);
        setUserFamilyId(null);
        setLoadingApp(false);

      } catch (error) {
        console.error("Error fetching user role/family:", error.message);
        setMessage({ text: "Error loading user data. Please refresh. " + error.message, type: "error" });
        setLoadingApp(false);
      }
    };

    fetchUserRoleAndFamily();

    // Set up realtime listeners for parents and children tables for the current user's auth_uid
    const parentChannel = supabase
      .channel('parent_profile_listener')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'parents', filter: `auth_uid=eq.${userId}` }, payload => {
        // Re-fetch role/family if parent record changes
        fetchUserRoleAndFamily();
      })
      .subscribe();

    const childChannel = supabase
      .channel('child_profile_listener')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'children', filter: `auth_uid=eq.${userId}` }, payload => {
        // Re-fetch role/family if child record changes
        fetchUserRoleAndFamily();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(parentChannel);
      supabase.removeChannel(childChannel);
    };
  }, [supabase, userId]); // Re-run if supabase client or userId changes

  // --- Handlers for state updates from child components ---

  // Called from RoleSelection when user picks 'parent' or 'child'
  const handleSelectRole = useCallback(async (role) => {
    if (!supabase || !userId) return;
    try {
      if (role === 'parent') {
        // Check if parent record already exists
        const { data: existingParent, error: fetchParentError } = await supabase
          .from('parents')
          .select('id')
          .eq('auth_uid', userId)
          .single();
  
        if (fetchParentError && fetchParentError.code !== 'PGRST116') throw fetchParentError; // PGRST116 means no rows found
  
        if (!existingParent) { // Only insert if no parent record exists for this auth_uid
          const { error } = await supabase
            .from('parents')
            .insert({ auth_uid: userId, name: "Parent " + userId.substring(0, 6) });
          if (error) throw error;
        }
  
      } else if (role === 'child') {
        // Check if child record already exists
        const { data: existingChild, error: fetchChildError } = await supabase
          .from('children')
          .select('id')
          .eq('auth_uid', userId)
          .single();
  
        if (fetchChildError && fetchChildError.code !== 'PGRST116') throw fetchChildError; // PGRST116 means no rows found
  
        if (!existingChild) { // Only insert if no child record exists for this auth_uid
          const { error } = await supabase
            .from('children')
            .insert({ auth_uid: userId, name: "Child " + userId.substring(0, 6), xp_balance: 0 });
          if (error) throw error;
        }
      }
      // The useEffect will re-fetch and update userRole state
      setUserRole(role);
    } catch (error) {
      console.error("Error setting role:", error.message);
      setMessage({ text: "Failed to set role. " + error.message, type: "error" });
    }
  }, [supabase, userId]);

  const handleSignInToPreviousAccount = useCallback(async (providedAuthUid) => {
    if (!supabase) {
      setMessage({ text: "App not initialized. Please wait.", type: "error" });
      return;
    }
    if (!providedAuthUid) {
      setMessage({ text: "Please enter an Auth ID.", type: "error" });
      return;
    }

    setLoadingApp(true); // Indicate loading

    try {
        // --- IMPORTANT: This is a HACKY SIMULATION for hackathon purposes. ---
        // In a real app, directly "logging in" by just providing an auth_uid
        // requires a custom JWT token generated securely on your backend.
        // This attempts to find if that user exists in your profiles,
        // and if so, simulates a "switch" by setting the userId state.
        // It does NOT truly re-authenticate the Supabase session
        // if the provided Auth ID doesn't match the current browser's session token.

        // Check if a profile exists for the provided Auth ID
        const { data: parentCheck, error: parentCheckError } = await supabase
            .from('parents')
            .select('auth_uid')
            .eq('auth_uid', providedAuthUid)
            .single();

        const { data: childCheck, error: childCheckError } = await supabase
            .from('children')
            .select('auth_uid')
            .eq('auth_uid', providedAuthUid)
            .single();

        if ((parentCheckError && parentCheckError.code !== 'PGRST116') || (childCheckError && childCheckError.code !== 'PGRST116')) {
            // Some other error occurred, not just "not found"
            throw new Error(parentCheckError?.message || childCheckError?.message || "Error checking profile.");
        }

        if (parentCheck || childCheck) {
            // If a record exists, we simulate a successful login
            // By setting the userId, our useEffect will re-fetch and update the UI
            // However, the underlying Supabase session in localStorage will remain the same.
            // This is purely for demonstrating a "switch" between known users *in this demo*.
            setUserId(providedAuthUid); // This triggers the useEffect to load this user's data
            setMessage({ text: "Switched to previous account ID. (Note: This is a hackathon simulation)", type: "info" });
        } else {
            setMessage({ text: "Provided Auth ID not found in records. Please ensure it's correct.", type: "error" });
            setLoadingApp(false); // Stop loading if not found
        }
    } catch (error) {
        console.error("Error switching account:", error.message);
        setMessage({ text: "Failed to switch account. " + error.message, type: "error" });
        setLoadingApp(false);
    }
  }, [supabase]);

  // Called from OnBoarding when family is created/joined
  const handleFamilyActionComplete = useCallback(async (familyId) => {
    // The OnBoarding component already updates the respective parent/child table.
    // The useEffect will re-fetch and update userFamilyId state.
    setUserFamilyId(familyId); // Optimistic update
  }, []);


  const handleSignOut = useCallback(async () => {
    if (supabase) {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        // Clear local state and let the auth listener handle re-signing in anonymously
        setUserRole(null);
        setUserFamilyId(null);
        setLoadingApp(true); // Set loading to true to re-initiate the flow
        setMessage({ text: "Signed out successfully.", type: "info" });
      } catch (error) {
        console.error("Error signing out:", error.message);
        setMessage({ text: "Failed to sign out. " + error.message, type: "error" });
      }
    }
  }, [supabase]);

  // --- Conditional Rendering Logic ---
  if (loadingApp) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-700">Loading application...</p>
      </div>
    );
  }

  // Render based on user's state
  if (!userRole) {
    return <RoleSelection userId={userId} onSelectRole={handleSelectRole} handleSignInToPreviousAccount={handleSignInToPreviousAccount} />;
  } else if (!userFamilyId) {
    return <OnBoarding supabase={supabase} userId={userId} userRole={userRole} onFamilyActionComplete={handleFamilyActionComplete} />;
  } else if (userRole === 'parent') {
    return <ParentDashboard supabase={supabase} userId={userId} familyId={userFamilyId} onSignOut={handleSignOut} />;
  } else if (userRole === 'child') {
    return <ChildDashboard supabase={supabase} userId={userId} familyId={userFamilyId} onSignOut={handleSignOut} />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <p className="text-xl text-gray-700">Something went wrong. Please refresh.</p>
      {message && <MessageBox message={message.text} type={message.type} onConfirm={() => setMessage(null)} />}
    </div>
  );
}