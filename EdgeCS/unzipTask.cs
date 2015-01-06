//#r "System.IO.Compression.dll"
//#r "System.IO.Compression.FileSystem.dll"

using System;
using System.Dynamic;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.IO;
using System.IO.Compression;

public class Startup {
    public async Task<object> Invoke(IDictionary<string, object> input) {
        var options = new {
            Path = (string)input["path"],
            Dest = (string)input["dest"],
            Log = (Func<object, Task<object>>)input["log"],
            Success = (Func<object, Task<object>>)input["success"],
            ShouldExtract = (Func<object, Task<object>>)input["match"],
            Flatten = (bool)input["flatten"],
            Overwrite = (bool)input["overwrite"],
            LeaveOriginalDate = (bool)input["leaveOriginalDate"],
        };

        var archive = ZipFile.OpenRead(options.Path);

        // Loop on each file
        foreach (var archiveFile in archive.Entries) {
            // Check if the glob pattern suggests it should be extracted
            var shouldExtract = (bool)await options.ShouldExtract(archiveFile.FullName);

            // Extract
            if (shouldExtract) {
                var pathToExtract = archiveFile.FullName;
                if (options.Flatten) pathToExtract = archiveFile.Name;

                pathToExtract = Path.Combine(options.Dest, pathToExtract);

                options.Log(pathToExtract);

                // Make sure the path exists
                Directory.CreateDirectory(Path.GetDirectoryName(pathToExtract));
                archiveFile.ExtractToFile(pathToExtract, options.Overwrite);

                if (!options.LeaveOriginalDate) {
                    options.Log("overwrite date");
                    File.SetLastWriteTime(pathToExtract, DateTime.Now);
                }

                // Log a successful extraction
                options.Success("Extracted: " + pathToExtract);
            }
        }

        return null;
    }

}
