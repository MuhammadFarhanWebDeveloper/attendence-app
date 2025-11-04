import * as SMS from "expo-sms";

/**
 * Sends a single generic message to multiple phone numbers.
 */
export async function sendUrduGroupMessage(to: string[]) {
  if (to.length === 0) return;
  const message =
    "آپ کا بچہ/بھائی آج اسکول میں غیر حاضر تھا۔ براہ کرم مطلع رہیں۔";
  const isAvailable = await SMS.isAvailableAsync();

  if (isAvailable) {
    await SMS.sendSMSAsync(to, message);
  } else {
    alert("SMS service is not available on this device");
  }
}
