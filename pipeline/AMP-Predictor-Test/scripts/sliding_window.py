import pandas as pd

def apply_sliding_window(df, window_size, stride_len):
    """
    Predicts parts of sequences for AMP-like activity.

    Arguments:
        window_size: length of sub-region in the sequence to be tested
        model: a trained model to be used for AMP prediction
    """
    # Chunk up the protein sequence
    print("sliding window search started...")
    tmp_chunked_seq = pd.DataFrame(
                df['sequence'].apply(
                lambda x: window_search(x, window_size, stride_len)
                ))

    expanded_seq = tmp_chunked_seq['sequence'].apply(
                        lambda x: pd.Series(x)) \
                        .stack() \
                        #.reset_index()

    chunked_df = pd.DataFrame(expanded_seq, columns=['sequence'])
    chunked_df.index.set_names(['seq_ID', 'index'], inplace=True)
    print("sliding window search done!!!")

    return chunked_df

def window_search(x, window_size, stride_len):
    end = len(x) - window_size + stride_len \
            if((len(x) - window_size + stride_len) > 0) \
            else 1

    return [x[i:i+window_size] for i in range(0, end, stride_len)]

