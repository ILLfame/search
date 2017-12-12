# gisearch is CLI search utility

## Installation

``$ [sudo] npm install -g gisearch``

## Usage:
    
### CLI   

    Usage:
        gisearch [--OPTION]=[ARGUMENTS]
    
    Options: 
        --DIR (required) base lookup directory
        --TYPE (optional) [D|F] D - directory, F - file
        --PATTERN (optional) regular expression to test file/directory name
        --MIN-SIZE (optional) minimum file size [B|K|M|G], skipped for directories
        --MAX-SIZE (optional) maximum file size [B|K|M|G], skipped for directories 
        
    (B - bytes, K - kilobytes, M - megabytes, G - gigabytes) 
      
    
### Example:  

> The order of the parameters is NOT strict. 

``gisearch --DIR="/Users/root/Downloads" --PATTERN=\.txt  --TYPE=F --MIN-SIZE=100M --MAX-SIZE=3G`` 

### License and Copyright
This software is released under the terms of the [ISC license](https://github.com/ILLfame/search/blob/master/LICENSE.md).