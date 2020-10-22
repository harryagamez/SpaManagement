using Spa.InfraCommon.SpaCommon.Models;
using System;
using System.Net.Mail;

namespace Spa.InfraCommon.SpaCommon.Helpers
{
    public static class MailHelper
    {
        public static bool SendMail(EmailModel eMailModel)
        {
            try
            {
                MailMessage message = new MailMessage
                {
                    From = new MailAddress("spapp.management@gmail.com"),
                    Subject = eMailModel.Subject,
                    Body = eMailModel.Body
                };
                message.To.Add(eMailModel.MailTo);
                message.IsBodyHtml = true;

                SmtpClient smtp = new SmtpClient("smtp.gmail.com")
                {
                    Port = 587,
                    EnableSsl = true,
                    UseDefaultCredentials = false,
                    Credentials = new System.Net.NetworkCredential("spapp.management@gmail.com", "hemojolrmtqxpdvq"),
                };
                smtp.Send(message);

                return true;
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}