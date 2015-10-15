using System;
using System.Drawing;
using System.IO;
using System.Net;
using gliist_server.Models;

namespace gliist_server.Helpers
{
    public static class ImageHelper
    {
        public static readonly int EventEmailImageMaxWidth = 360;
        public static readonly int EventEmailImageMaxHeight = 480;
        public static readonly int LogoEmailImageMaxWidth = 360;
        public static readonly int LogoEmailImageMaxHeight = 100;

        public static ImageDimensions GetImageSizeByUrl(string url)
        {
            var imageInfo = new ImageDimensions();
            try
            {
                using (WebClient wc = new WebClient())
                {
                    byte[] bytes = wc.DownloadData(url);
                    using (MemoryStream ms = new MemoryStream(bytes))
                    {
                        var image = Image.FromStream(ms);
                        imageInfo.Width = image.Width;
                        imageInfo.Height = image.Height;
                    }
                }
            }
            catch (Exception)
            {
                return null;
            }
            return imageInfo;
        }

        public static string GetLogoImageUrl(string companyImageUrl, string profileImageUrl)
        {
            return string.IsNullOrEmpty(profileImageUrl) ? companyImageUrl : profileImageUrl;
        }

        public static ImageDimensions GetScaledDimensions(ImageDimensions originalDimensions, int maxWidth, int maxHeight)
        {
            if (originalDimensions == null || originalDimensions.Width == 0 || originalDimensions.Height == 0)
            {
                return null;
            }

            double ratio = (double)originalDimensions.Width / (double)originalDimensions.Height;
            var scaledDimensions = new ImageDimensions();

            scaledDimensions.Width = originalDimensions.Width;
            scaledDimensions.Height = originalDimensions.Height;

            if (originalDimensions.Width > maxWidth)
            {
                scaledDimensions.Width = maxWidth;
                scaledDimensions.Height = (int)Math.Round(((double)maxWidth / ratio));
            }

            if (scaledDimensions.Height > maxHeight)
            {
                scaledDimensions.Height = maxHeight;
                scaledDimensions.Width = (int)Math.Round(((double)maxHeight * ratio));
            }

            return scaledDimensions;
        }
    }
}