def convert_to_reduced(sequence_df, is_reduced, method_dict, reduced_matrices):
    """
    Takes a single raw amino acid sequence and convert it to "reduced"
    alphabet form as described in DIAMOND
    Potentially use pandas for vectorized string operation
    """
    methods = []
    reduced_seqs_dict = {}

    #use amino acid reduced representation if selected as yes in config file
    if('y' in is_reduced.lower()):
        for method in method_dict:
            if('y' in method_dict[method].lower()):
                methods.append(method)

        for method in methods:
            tmp_df = sequence_df.copy()
            reducer_dict = {}
            map_table = reduced_matrices[method]

            # inverse key and values in the map table
            for key in map_table:
                for code in map_table[key]:
                        reducer_dict[code] = key

            # convert amino acid sequences to reduced version and add to
            # dictionary
            for code in reducer_dict:
                tmp_df['sequence'] = tmp_df['sequence'].str.replace(code, reducer_dict[code])
            reduced_seqs_dict[method] = tmp_df

        return reduced_seqs_dict
    else:
        method = 'full'
        reduced_seqs_dict[method] = in_seqs

        return reduced_seqs_dict
