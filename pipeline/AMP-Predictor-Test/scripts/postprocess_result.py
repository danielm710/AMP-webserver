def get_amp_subsequences(amp_indice_dict, seq_dict):
    """
    Finds subsequence and whether it's an AMP region or not.

    Input:
        - amp_indice_dict: sequence ID as key, list of dicts as value.
            {sequenceID: [{'start': start_idx,
                            'end': end_idx}, ...]
            }

        - seq_dict: dict with sequence ID as key, 
            corresponding full sequence as value.

    Output:

    """
    isAMP = True
    amp_dict = {}

    for _id in amp_indice_dict:
        amp_subseq_list = []
        start = -1
        end = -1
        prevStart = -1
        prevEnd = -1
        amp_indices = amp_indice_dict[_id]
        sequence = seq_dict[_id]

        # No AMP region
        if(len(amp_indices) == 0):
            data = {
                    'subSequence': sequence,
                    'isAMP': False
                    }
            amp_subseq_list.append(data)
            amp_dict[_id] = amp_subseq_list

        # AMP regions
        else:
            counter = 1
            for positions in amp_indices:
                tmp_non_amp_d = {}
                tmp_amp_d = {}
                non_amp = ''
                # AMP starts in the beginning? 
                start = positions['start']
                end = positions['end']

                amp = sequence[start:end]
                # First occurence
                if(counter == 1):
                    non_amp = sequence[0:start]
                # Last occurence
                elif(counter == len(amp_indices)):
                    tmp_last_d = {}
                    # non-AMP region occurs before the last AMP region
                    non_amp = sequence[prevEnd:start]

                    #if(_id == 'Q64JE6'): print(non_amp)
                    if(non_amp):
                        tmp_non_amp_d['isAMP'] = False
                        tmp_non_amp_d['subSequence'] = non_amp
                        amp_subseq_list.append(tmp_non_amp_d)
                        #print(amp_subseq_list)

                    tmp_amp_d['isAMP'] = True
                    tmp_amp_d['subSequence'] = amp
                    amp_subseq_list.append(tmp_amp_d)
                    #print(amp_subseq_list)

                    # non-AMP region occurs at the end (After AMP region)
                    non_amp = sequence[end:]

                    if(non_amp):
                        tmp_last_d['isAMP'] = False
                        tmp_last_d['subSequence'] = non_amp
                        amp_subseq_list.append(tmp_last_d)

                    break

                else:
                    non_amp = sequence[prevEnd:start]

                prevStart = start
                prevEnd = end
                counter = counter +1

                if(non_amp):
                    tmp_non_amp_d['isAMP'] = False
                    tmp_non_amp_d['subSequence'] = non_amp
                    amp_subseq_list.append(tmp_non_amp_d)

                tmp_amp_d['isAMP'] = True
                tmp_amp_d['subSequence'] = amp
                amp_subseq_list.append(tmp_amp_d)

                # Special case: only one entry
                # Add the last bit
                if(len(amp_indices) == 1):
                    non_amp = sequence[end:]
                    if(non_amp):
                        tmp_non_amp_d['isAMP'] = False
                        tmp_non_amp_d['subSequence'] = non_amp
                        amp_subseq_list.append(tmp_non_amp_d)


        amp_dict[_id] = amp_subseq_list


    return amp_dict

def get_amp_region_index(seq_dict, chunked_amp_dict):
    """
    Finds starting and ending indices of AMP region in a sequence

    Output:
        - amp_indice_dict: seqID as key, list of dict as value
        {sequenceID: [{'start': start_idx,
                        'end': end_idx}, ...]
        }
    """
    amp_indice_dict = {}

    for _id in seq_dict:
        amp_indices = []
        start = -1
        end = -1
        currStart = -1
        currEnd = -1
        prevStart = -1
        prevEnd = -1
        # Sequence has AMP region
        if(_id in chunked_amp_dict):
            chunked_seqs = chunked_amp_dict[_id]
            for chunked in chunked_seqs:
                # Find the location (index) of first occurence of a sub-sequence
                currStart = seq_dict[_id].find(chunked)
                currEnd = currStart + len(chunked)
                if(prevEnd != -1):
                    # Discontinuous case
                    if(currStart > prevEnd):
                        # Store and keep track again
                        amp_indices.append({'start': start, 'end': end})
                        start = currStart
                        end = currEnd
                    # Continuous case
                    else:
                        end = currEnd
                # First iteration
                else:
                    start = currStart
                    end = currEnd
                prevStart = currStart
                prevEnd = currEnd
                #print("{}: {}".format(_id, start))
            amp_indices.append({'start': start, 'end': end})
            # Add to dict
            amp_indice_dict[_id] = amp_indices

        # Sequence does not have AMP region in it
        else:
            amp_indice_dict[_id] = []

    return amp_indice_dict

def get_probability_profile(d, step_len):
    """
    Returns a list of dictionaries containing AMP probabillity profile.

    Input:
        - d: dictionary converted from predition dataframe
        - step_len: sliding window stride length

    Output:
        - prob_profile: sequence ID as key, probability profile (dict) as value.
        [{'Start': start index,
        'End': end index,
        'Probability': probability of region being AMP},
        ...]
    """
    prob_profile = {}
    prevID = ''
    currentID = ''
    regions = []

    # Get sorted keys
    sorted_keys = sort_dict_by_keys(d)

    for k in sorted_keys:
        prevID = currentID
        currentID = k[0]
        region = {}

        if(currentID != prevID and prevID):
            prob_profile[prevID] = regions
            regions = []

        #prob = round(d[k]['Probability'], 3) * 100
        prob_formatted = '%.1f' % (d[k]['Probability'] * 100)
        start = int(k[1]) * step_len
        end = start + d[k]['Length']

        region['Start'] = start
        region['End'] = end
        region['Probability'] = prob_formatted
        regions.append(region)

    # Add last entry
    prob_profile[currentID] = regions
    return prob_profile

def sequence_dict_from_df(d, window_size, step_len):
    """
    Output:
        - seq_dict: dict with sequence ID as key, 
            corresponding full sequence as value.
        - chunked_amp_dict: dict with sequence ID as key,
            list of AMP segments as value.
    """

    # Return empty dicts if empty df
    if(len(d) == 0):
        return {}, {}

    # d = {key: value}
    # key = (seqID, level)
    # value = data
    prevID = ''
    currentID = ''
    seq = ""
    renew = False # to skip the first ID until its sequence is fully constructed
    chunked_amp_dict = {}
    seq_dict = {}

    # Get sorted keys
    sorted_keys = sort_dict_by_keys(d)

    for k in sorted_keys:
        prevID = currentID
        currentID = k[0] # sequence ID

        # Entry already exists in the list
        if(currentID == prevID):
            # Retrieve full sequence
            chunked_seq = d[k]['Sequence']
            start = window_size - step_len
            end = len(chunked_seq)
            seq = seq + chunked_seq[start:end]
            # Get AMP region if prob >= 0.5
            if(d[k]['Probability'] >= 0.5):
                chunked_amp_dict.setdefault(k[0], []).append(chunked_seq)

        # New entry 
        else:
            # add to sequence dictionary iff the sequence is complete
            if(renew):
                seq_dict[prevID] = seq
                seq = ''
            renew = True
            # Retrieve full sequence
            chunked_seq = d[k]['Sequence']
            seq = seq + chunked_seq
            # Get AMP region if prob >= 0.5
            if(d[k]['Probability'] >= 0.5):
                chunked_amp_dict.setdefault(k[0], []).append(chunked_seq)

    # Add last complete sequence
    seq_dict[currentID] = seq

    return seq_dict, chunked_amp_dict


def multi_df_to_JSON(df, hmm_metadata, window_size, step_len):
    """
    Converst multiindex pandas dataframe to JSON format.

    Input:
        - df: multiindex pandas dataframe.
        - hmm_metadata: hmm result.
        - window_size: size of the sliding window.
        - step_len: how much to slide the window by.

    Output:
        JSON converted result.
    """
    d = df.to_dict(orient='index')
    seq_dict, chunked_amp_dict = sequence_dict_from_df(d, window_size, step_len)    

    amp_indice_dict = get_amp_region_index(seq_dict, chunked_amp_dict)
    amp_dict = get_amp_subsequences(amp_indice_dict, seq_dict)
    prob_profile = get_probability_profile(d)
    # Create JSON finally...
    json_data = []
    for _id in amp_dict:
        data = {
                'seqID': _id,
                'sequence': seq_dict[_id],
                'ampRegion': amp_dict[_id],
                'HMM': hmm_metadata[_id] if(_id in hmm_metadata) else False,
                'length': len(seq_dict[_id]),
                'probabilityProfile': prob_profile[_id]
                }
        json_data.append(data)
    return json_data

def sort_dict_by_keys(d):
    """
    Sort dictionary by keys.

    Returns list of sorted keys
    """

    return sorted(d)