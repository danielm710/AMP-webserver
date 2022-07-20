import math
import multiprocessing as mp
import pandas as pd
import re
import itertools

def product(sample, alphabet, k):
    return [''.join(p) for p in itertools.product(sample, *itertools.repeat(alphabet, k-1))]

def compute_kmer_table(is_reduced, method_dict, reduced_matrices, num_core):
    # Store representation method as key, K as value
    reduced_dict = {}
    # Store representation method as key, list of kmers as value
    kmers_dict = {}

    if('y' in is_reduced.lower()):
        for method in method_dict:
            if('y' in method_dict[method].lower()):
                reduced_dict[method] = method_dict[method].split(",")[1]

    else:
        reduced_dict['full'] = is_reduced.split(",")[1]

    for method in reduced_dict:
        kmers = []
        if not (method == 'full'):
            reduced_matrix = reduced_matrices[method]
            reduced_keys = set(reduced_matrix.keys())
            alphanumerics = 'abcdefghijklmnopqrstuvwxyz0123456789'
            representation = ''.join(set(alphanumerics).intersection(reduced_keys))
        else:
            representation = 'ACDEFGHIKLMNPQRSTVWY'

        lower_k = int(reduced_dict[method].split(":")[0])
        upper_k = int(reduced_dict[method].split(":")[1])

        # num_proc should be less than the length of representation 
        num_proc = min(num_core, len(representation))
        part_size = math.ceil(len(representation) / num_proc)
        pool = mp.Pool(processes = num_proc)

        tmp = []
        for i in range(num_proc):
            if(i == num_proc - 1):
                sampled = representation[part_size * i:]
            else:
                sampled = representation[part_size * i: part_size * (i+1)]

            for i in range(lower_k, upper_k + 1):
                tmp.append(pool.apply_async(product, [sampled, representation, i]))

        pool.close()
        pool.join()

        # Unpack multiprocessing worker output
        result = [p.get() for p in tmp]
        kmers = [kmer for sublist in result for kmer in sublist]
        print("Total of {kmers} kmers for {method}".format(
            kmers=len(kmers),
            method=method
            ))
        kmers_dict[method] = kmers

    return kmers_dict

def calculate_length(reduced_seqs):
    """
    Get length of the sequence
    """
    for method in reduced_seqs:
        reduced_seqs[method]['length'] = reduced_seqs[method]['sequence'].str.len()

    return reduced_seqs

def calculate_frequency_par(reduced_seq, sampled_kmer_table):
    """
    helper function for calculate_kmer_frequency.
    It parallelizes kmer profile frequency calculation
    """
    df = pd.DataFrame(index=reduced_seq.index)

    for kmer in sampled_kmer_table:
        df[kmer] = reduced_seq['sequence'].apply(lambda x: len(re.findall('(?={0})'.format(kmer), x)))

    return df

def calculate_relative_frequency(reduced_seqs, kmer_tables, num_core):
    """
    Returns m by p K-mer frequency matrix

    m: Number of samples
    p: Number of K-mer profile
    """
    # list to store frequency dataframes
    kmer_freq_list = []

    print("calculating frequency")
    for method in reduced_seqs:
        print("Processing {}...".format(method))
        # store length column to be appended later
        length_col = reduced_seqs[method]['length']
        # retrieve corresponding kmer table
        kmer_table = kmer_tables[method]

        part_size = math.ceil(len(kmer_table) / num_core)

        pool = mp.Pool(processes = num_core)

        tmp = []
        for i in range(num_core):
            if(i == num_core - 1):
                sampled = kmer_table[part_size * i:]
            else:
                sampled = kmer_table[part_size * i: part_size * (i+1)]

            # run
            tmp.append(pool.apply_async(
                calculate_frequency_par, args=(reduced_seqs[method], sampled, )
                ))

        pool.close()
        pool.join()

        frames = [p.get() for p in tmp]

        freq_df = pd.concat(frames, axis=1)
        kmer_freq_list.append(freq_df)

    final_freq_df = pd.concat(kmer_freq_list, axis=1)
    final_freq_df['length'] = length_col
    print("calculating frequency done!")

    rel_freq_df = final_freq_df.apply(lambda x: x/x['length'],
            axis=1).drop('length', axis=1)

    return rel_freq_df
