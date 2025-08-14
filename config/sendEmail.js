//this for send message to email

import  send from "./emailService.js";

const sendEmailFun = async (to, subject, text, html) => {
    const result = await send(to, subject, text, html);
    if (result.success) {
        return true;
        // res.status(200).json({ message: 'Email sent successfully', messageId: result.messageId });
    } else {
        return false;
        // res.status(500).json({ message: 'Failed to send email', error: result.error });
    }
}

export default sendEmailFun;