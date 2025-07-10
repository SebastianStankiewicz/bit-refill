import React, { useState } from "react";
import Image from "next/image";
import MessageBox from "./MessageBox"; // Import MessageBox

function OnBoarding({
  supabase,
  userId,
  userRole,
  onFamilyActionComplete,
  setUserId,
}) {
  const [childName, setChildName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [familyCodeInput, setFamilyCodeInput] = useState("");
  const [bitRefillAPI, setBitRefillAPI] = useState("");
  const [generatedFamilyCode, setGeneratedFamilyCode] = useState("");
  const [message, setMessage] = useState(null); // For MessageBox

  // --- Parent: Create Family ---
  const handleCreateFamily = async () => {
    if (!familyName.trim()) {
      setMessage({ text: "Please enter a family name.", type: "error" });
      return;
    }

    if (!bitRefillAPI.trim()) {
      setMessage({ text: "Please enter a Bitrefill API key.", type: "error" });
      return;
    }

    const familyCode = Math.random().toString(36).substring(2, 8).toUpperCase(); // Simple random code

    try {
      // 1. Create parent record if not exists (or fetch existing parent_id)
      let parentRecordId;
      const { data: existingParent, error: fetchParentError } = await supabase
        .from("parents")
        .select("id")
        .eq("auth_uid", userId)
        .single();

      if (fetchParentError && fetchParentError.code !== "PGRST116")
        throw fetchParentError; // PGRST116: no rows found

      if (existingParent) {
        parentRecordId = existingParent.id;
      } else {
        const { data: newParent, error: insertParentError } = await supabase
          .from("parents")
          .insert({
            auth_uid: userId,
            name: "Parent " + userId,
          }) // Placeholder name
          .select("id")
          .single();
        if (insertParentError) throw insertParentError;
        parentRecordId = newParent.id;
      }

      // 2. Create family record
      const { data: newFamily, error: familyError } = await supabase
        .from("families")
        .insert({
          family_name: familyName.trim(),
          family_code: familyCode,
          parent_auth_uid: userId, // Store parent's auth_uid here
          bitrefill_api_key: bitRefillAPI.trim(),
        })
        .select("id") // Select the inserted row to get its ID
        .single();

      if (familyError) throw familyError;
      if (!newFamily) throw new Error("Failed to create family record.");

      const newFamilyId = newFamily.id;

      const { error: giftCardError } = await supabase
        .from("family_gift_cards")
        .insert({
          family_id: newFamilyId,
          product_name: "Test",
          value_in_currency: 0,
          currency: "USD",
          image_url:
            "https://cdn.bitrefill.com/primg/w720h432/bitrefill-giftcard-usd.webp",
          is_active: true,
          bitrefill_product_id: "test-gift-card-code",
          xp_cost: 100,
        });

      if (giftCardError) throw giftCardError;

      // 3. Update parent's profile (in 'parents' table) with the new familyId if needed,
      // or directly use the familyId to transition the UI state.
      // For this schema, the parent's family association is implicitly via the `families` table.
      // We just need to tell the main app that family action is complete.
      onFamilyActionComplete(newFamilyId);
      setGeneratedFamilyCode(familyCode);
      setMessage({
        text: `Family "${familyName}" created! Share code: ${familyCode}`,
        type: "info",
      });
    } catch (error) {
      console.error("Error creating family:", error.message);
      setMessage({
        text: "Failed to create family. " + error.message,
        type: "error",
      });
    }
  };

  // --- Child: Join Family ---
  const handleJoinFamily = async () => {
    if (!familyCodeInput.trim()) {
      setMessage({ text: "Please enter a family code.", type: "error" });
      return;
    }

    try {
      // 1. Find the family by code
      const { data: families, error: fetchError } = await supabase
        .from("families")
        .select("id, family_name")
        .eq("family_code", familyCodeInput.trim());

      if (fetchError) throw fetchError;

      if (!families || families.length === 0) {
        setMessage({
          text: "Family code not found. Please check and try again.",
          type: "error",
        });
        return;
      }

      const familyId = families[0].id;
      const familyName = families[0].family_name;

      // 2. Create child record if not exists (or fetch existing child_id)
      let childRecordId;
      const { data: existingChild, error: fetchChildError } = await supabase
        .from("children")
        .select("id")
        .eq("auth_uid", userId)
        .single();

      if (fetchChildError && fetchChildError.code !== "PGRST116")
        throw fetchChildError;

      if (existingChild) {
        childRecordId = existingChild.id;
      } else {
        const { data: newChild, error: insertChildError } = await supabase
          .from("children")
          .insert({ auth_uid: userId, name: childName }) // Placeholder name
          .select("id")
          .single();
        if (insertChildError) throw insertChildError;
        childRecordId = newChild.id;
      }

      // 3. Update child's record with the joined familyId
      const { error: updateChildError } = await supabase
        .from("children")
        .update({ family_id: familyId })
        .eq("id", childRecordId); // Use the bigint ID for update

      if (updateChildError) throw updateChildError;

      onFamilyActionComplete(familyId); // Notify main app that family action is complete
      setMessage({
        text: `Successfully joined family "${familyName}"!`,
        type: "info",
      });
    } catch (error) {
      console.error("Error joining family:", error.message);
      setMessage({
        text: "Failed to join family. " + error.message,
        type: "error",
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50 font-sans">
      <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-md text-center space-y-8">
        {userRole === "child" && (
          <div className="space-y-6">
            <div className="flex justify-center mb-4">
              <Image
                src="/bitrefill-logo.svg"
                alt="Bitrefill Logo"
                width={180}
                height={54}
                className="h-10 w-auto"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Join Family</h1>
            <input
              type="text"
              placeholder="First Name"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-center"
            />
            <p className="text-lg text-gray-600">
              Enter your family's unique code.
            </p>
            <input
              type="text"
              placeholder="Family Code"
              value={familyCodeInput}
              onChange={(e) => setFamilyCodeInput(e.target.value)}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-center"
            />

            <button
              onClick={handleJoinFamily}
              className="w-full px-6 py-3 bg-[#002B28] text-white rounded-lg shadow-md hover:bg-[#004540] transition-colors text-xl font-semibold"
            >
              Continue
            </button>
          </div>
        )}

        {userRole === "parent" && (
          <div className="space-y-6">
            <div className="flex justify-center mb-4">
              <Image
                src="/bitrefill-logo.svg"
                alt="Bitrefill Logo"
                width={180}
                height={54}
                className="h-10 w-auto"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Create Family</h1>

            <p className="text-lg text-gray-600">
              Enter your Bitrefill API key. Secure icon here{" "}
            </p>
            <input
              type="text"
              placeholder="Bitrefill API key"
              value={bitRefillAPI}
              onChange={(e) => setBitRefillAPI(e.target.value)}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-center"
            />
            <p className="text-lg text-gray-600">
              Enter a name for your family.
            </p>
            <input
              type="text"
              placeholder="Family Name"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-center"
            />

            <button
              onClick={handleCreateFamily}
              className="w-full px-6 py-3 bg-[#002B28] text-white rounded-lg shadow-md hover:bg-[#004540] transition-colors text-xl font-semibold"
            >
              Create Family
            </button>

            {generatedFamilyCode && (
              <div className="mt-8 pt-6 border-t border-gray-200 space-y-4">
                <p className="text-lg text-gray-700 font-semibold">
                  Share this code with your children:
                </p>
                <div className="bg-gray-100 border border-dashed border-gray-300 p-4 rounded-lg">
                  <p className="text-4xl font-extrabold text-blue-700 tracking-wider">
                    {generatedFamilyCode}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {message && (
        <MessageBox
          message={message.text}
          type={message.type}
          onConfirm={() => setMessage(null)}
        />
      )}
    </div>
  );
}

export default OnBoarding;
