using System;
using System.IO;
using System.Net;
using System.Text;

namespace Spa.InfraCommon.SpaCommon.Helpers
{
    public static class FTPHelper
    {
        public static void UploadDocumentToFtp(string Content, string FileName, string FTPServer, string UserName, string Password)
        {
            try
            {
                Uri TempURI = new Uri(Path.Combine(FTPServer, FileName));
                FtpWebRequest FTPRequest = (FtpWebRequest)FtpWebRequest.Create(TempURI);
                FTPRequest.Credentials = new NetworkCredential(UserName, Password);
                FTPRequest.KeepAlive = false;
                FTPRequest.Method = WebRequestMethods.Ftp.UploadFile;
                FTPRequest.UseBinary = true;
                FTPRequest.ContentLength = Content.Length;
                FTPRequest.Proxy = null;

                using (Stream TempStream = FTPRequest.GetRequestStream())
                {
                    ASCIIEncoding TempEncoding = new ASCIIEncoding();
                    byte[] TempBytes = TempEncoding.GetBytes(Content);
                    TempStream.Write(TempBytes, 0, TempBytes.Length);
                }
                FTPRequest.GetResponse();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public static bool FtpDirectoryExist(string FTPAddress, string UserName, string Password)
        {
            try
            {
                FtpWebRequest request = (FtpWebRequest)WebRequest.Create(FTPAddress);
                request.Credentials = new NetworkCredential(UserName, Password);
                request.Method = WebRequestMethods.Ftp.ListDirectory;
                FtpWebResponse response = (FtpWebResponse)request.GetResponse();
                return true;
            }
            catch (WebException ex)
            {
                FtpWebResponse response = (FtpWebResponse)ex.Response;
                if (response.StatusCode == FtpStatusCode.ActionNotTakenFileUnavailable)
                    return false;
                throw;
            }
        }
    }
}
