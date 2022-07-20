import pandas as pd

def predict(model, rel_freq_profile, original_df, hmm_accessions, header_dict):
    pred_prob = model.predict_proba(rel_freq_profile)
    pred = [a[1] for a in pred_prob]

    output_df = pd.DataFrame(index=original_df.index)
    output_df['Probability'] = pred
    output_df['Length'] = original_df['sequence'].str.len()
    output_df['Sequence'] = original_df['sequence']

    # Sort output dataframe, and treat second index as column
    sorted_df = output_df.sort_index()\
            #.reset_index()

    # Add HMM information
    sorted_df["HMM"] = 0
    sorted_df.loc[hmm_accessions, "HMM"] = 1
    sorted_df['isAMP'] = sorted_df['Probability'] >= 0.5

    # Map the old headers to back to df
    multi_index = pd.MultiIndex.from_tuples(sorted_df.index,
            names=['seqID', 'level'])
    modified_level = multi_index.levels[0].map(header_dict.get)
    new_index = multi_index.set_levels(modified_level, level=0)
    sorted_df.index = new_index

    # Sequence is deemed positive if any of the regions is predicted as
    # positive
    amp_idx_list = sorted_df.index[sorted_df['isAMP']].tolist()
    pos_pred_idx = {idx[0] for idx in amp_idx_list}
    neg_pred_idx = set(sorted_df.index.levels[0]).difference(pos_pred_idx)

    # Indices must be passed as list, not set; it will throw error if set
    pos_pred_df = sorted_df.loc[list(pos_pred_idx)]
    neg_pred_df = sorted_df.loc[list(neg_pred_idx)]

    return pos_pred_df, neg_pred_df

def predict_benchmark(model, rel_freq_profile):
    pred_prob = model.predict_proba(rel_freq_profile)
    pred = [a[1] for a in pred_prob]

    output_df = pd.DataFrame(index=rel_freq_profile.index)
    output_df['Probability'] = pred

    pos_pred_df = output_df[output_df['Probability'] >= 0.5]
    neg_pred_df = output_df[output_df['Probability'] < 0.5]

    return pos_pred_df, neg_pred_df
