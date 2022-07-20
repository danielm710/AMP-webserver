# Need to add try/except clauses
def read_fasta(in_file):
    """
    Read a fasta file, and return a dictionary with ID as key and sequence as
    value
    """
    pattern = ">"
    header = ""
    protein_sequence = ""
    protein_dict = {}

    with open(in_file, 'r') as in_fasta:
        for line in in_fasta:
            # store line as header, and empty protein_sequence if header line
            if pattern in line:
                # store header and corresponding sequence in dictionary
                if(header and protein_sequence):
                    protein_dict[header] = protein_sequence
                # store accessionID as key if present; otherwise store whole
                # line
                if("|" in line):
                    header = line.split('|')[1].strip()
                else:
                    header = line.strip(">").strip()
                protein_sequence = ""
            # construct protein_sequence
            else:
               protein_sequence = protein_sequence.strip() + line.strip()

    # store last protein entry
    protein_dict[header] = protein_sequence

    return protein_dict
