import "dotenv/config";
import { sendEmail } from "../failure/email.js";

const reminder = async () => {
  await sendEmail(
    "LinkedIn Auth - Reminder",
    "Complete the LinkedIn Auth process by running the following command in your project root:\n\nnode utils/linkedInAuth/auth.js"
  );
};

await reminder();
