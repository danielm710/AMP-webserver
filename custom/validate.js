// Check for valid fasta format
// Can only have 20 standard AA characters and a gap (X)
// No duplicate headers allowed
var checkFasta = function (fasta) {
    let lineCounter = 1;
    const headerDict = {};
    const invalidLines = [];
    const duplicateHeaderLines = [];

    if (!fasta) { // check there is something first of all
        throw new Error('Empty fasta!');
    }

    // immediately remove trailing spaces
    fasta = fasta.trim();
    if (!fasta) {
        throw new Error('Fasta only has whitespaces')
    }

    // split on newlines... 
    var lines = fasta.split('\n');

    // Iterate through lines
    for(i = 0; i < lines.length; i++) {
        line = lines[i].trim();

        // Check for header
        if(line.startsWith('>')) {
            // Append to a set for duplicate check
            header = line.trim('>')
            if(header in headerDict) {
                duplicateLines = headerDict[header].toString() + ", " + lineCounter.toString();
                duplicateHeaderLines.push(duplicateLines);
            } else {
                headerDict[header] = lineCounter;
            }
            // Skip header line
            lineCounter++;
            continue;
        }

        // Check for valid fasta
        pattern = new RegExp('^[ACDEFGHIKLMNPQRSTVWXY\s]+$')
        if(!pattern.test(line)) {
            invalidLines.push(lineCounter);
        }
        lineCounter++;
    }

    const invalidErr = invalidLines.map(line => {
        info = "Non-valid FASTA format detected at line ";
        return info + line.toString();
    })

    const duplicateErr = duplicateHeaderLines.map(line => {
        info = "Duplicate headers detected at lines ";
        return info + line;
    })
    const errMsgs = invalidErr.concat(duplicateErr)

    if(errMsgs.length > 0) {
        throw new Error(errMsgs.join('\n'));
    } else {
        return true;
    }
}

module.exports = {
    checkFasta
}