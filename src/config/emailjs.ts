/**
 * EmailJS — ხელმოსაწერი დოკუმენტის მეილის გაგზავნა (client-side).
 */
import emailjs from '@emailjs/browser';

export const EMAILJS = {
  serviceId: 'service_hd6z65o',
  templateId: 'template_vrzvodp',
  publicKey: 'oWNpureqJLcYOWZyC',
};

export interface SignEmailParams {
  to_email: string;
  recipient_name: string;
  sender_name: string;
  document_name: string;
  expiration_date: string;
  message: string;
  sign_url: string;
  company_name?: string;
}

/** ხელმოსაწერი ბმულის მეილის გაგზავნა. */
export async function sendSignEmail(params: SignEmailParams): Promise<void> {
  await emailjs.send(
    EMAILJS.serviceId,
    EMAILJS.templateId,
    { company_name: 'საგრანტო კონტროლი', ...params },
    { publicKey: EMAILJS.publicKey },
  );
}
