using Microsoft.WindowsAzure;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace gliist_server.Helpers
{
    internal static class BlobHelper
    {
        public static CloudBlobContainer GetWebApiContainer(string containerName)
        {
            // Retrieve storage account from connection-string
            CloudStorageAccount storageAccount = CloudStorageAccount.Parse(
                CloudConfigurationManager.GetSetting("CloudStorageConnectionString"));

            // Create the blob client 
            CloudBlobClient blobClient = storageAccount.CreateCloudBlobClient();

            // Retrieve a reference to a container 
            // Container name must use lower case
            CloudBlobContainer container = blobClient.GetContainerReference(containerName);

            // Create the container if it doesn't already exist            
            container.CreateIfNotExists();

            // Enable public access to blob
            var permissions = container.GetPermissions();
            if (permissions.PublicAccess == BlobContainerPublicAccessType.Off)
            {
                permissions.PublicAccess = BlobContainerPublicAccessType.Blob;
                container.SetPermissions(permissions);
            }

            return container;
        }
    }
}