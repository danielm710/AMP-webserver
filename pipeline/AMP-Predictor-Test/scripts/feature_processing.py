# Statistics libraries
from scipy import stats
from statsmodels.stats import multitest

# Other modules
import pandas as pd
import numpy as np

def Mann_Whitney_U_test(pos_freq, neg_freq, method, adjusted_pval, threshold):
    """
    Performs Mann Whitney U test on positive and negative features
    to see if each K-mer distribution is significantly different

    Returns list of K-mers that pass Mann Whitney U test
    """
    u_test_df = pd.DataFrame(index=pos_freq.columns, columns=['pval'], data='NaN')
    for kmer in pos_freq.columns:
        if((stats.tiecorrect(pos_freq[kmer]) == 0) or
            (stats.tiecorrect(neg_freq[kmer]) == 0)):
            p = 1
        else:
            __, p = stats.mannwhitneyu(pos_freq[kmer], neg_freq[kmer],
                    alternative='two-sided')

        u_test_df.loc[kmer]['pval'] = p

    u_test_df['adjusted'] = multitest.multipletests(
                                pvals=u_test_df['pval'],
                                alpha=0.05,
                                method=method)[1]

    pos_mean = pos_freq.mean()
    neg_mean = neg_freq.mean()
    # Calculates percent difference
    u_test_df['diff'] = abs(pos_mean - neg_mean) / ((pos_mean + neg_mean) / 2)

    Mann_Whitney_kmers = list(u_test_df[
            (u_test_df['adjusted'] <= adjusted_pval) &

            (u_test_df['diff'] >= threshold)].index)

    return Mann_Whitney_kmers

def Welch_t_test(pos_freq, neg_freq, method, adjusted_pval, threshold):
    """
    Performs Mann Whitney U test on positive and negative features
    to see if each K-mer distribution is significantly different

    Returns list of K-mers that pass Mann Whitney U test
    """
    t_test_df = pd.DataFrame(index=pos_freq.columns, columns=['pval'], data='NaN')
    for kmer in pos_freq.columns:
        if((stats.tiecorrect(pos_freq[kmer]) == 0) or
            (stats.tiecorrect(neg_freq[kmer]) == 0)):
            p = 1
        else:
            __, p = stats.ttest_ind(pos_freq[kmer], neg_freq[kmer],
                    equal_var=False)

        t_test_df.loc[kmer]['pval'] = p

    t_test_df['adjusted'] = multitest.multipletests(
                                pvals=t_test_df['pval'],
                                alpha=0.05,
                                method=method)[1]

    pos_mean = pos_freq.mean()
    neg_mean = neg_freq.mean()
    # Calculates percent difference
    t_test_df['diff'] = abs(pos_mean - neg_mean) / ((pos_mean + neg_mean) / 2)

    t_test_kmers = list(t_test_df[
            (t_test_df['adjusted'] <= adjusted_pval) &
            (t_test_df['diff'] >= threshold)].index)

    return t_test_kmers

def remove_correlated_features(pos_samples, neg_samples, threshold):
    """
    Remove highly correlated features
    """
    df_new = pd.concat([pos_samples, neg_samples])
    corr_matrix = df_new.corr().abs()
    upper = corr_matrix.where(np.triu(np.ones(corr_matrix.shape),
        k=1).astype(np.bool))

    correlated = [column for column in upper.columns \
            if any(upper[column] > threshold)]
    to_drop = correlated[1:]

    print("Dropping {}".format(tuple(to_drop)))

    initial_kmers = list(pos_samples.columns)
    candidate_kmers = [kmer for kmer in initial_kmers if kmer not in to_drop]

    return candidate_kmers

