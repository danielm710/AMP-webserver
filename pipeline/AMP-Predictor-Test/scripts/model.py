# Import libraries
import numpy as np
#import luigi
import logging
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
# For hyperparamter tuning
from sklearn.model_selection import GridSearchCV

def fit_model(train_data, train_lbl, score, k, num_cores):
    """
    Given positive and negative samples, split the samples to training
    and testing, and fit a model and save it


    Input:
        train_data: training data in pandas dataframe
                    Samples have m*p dimensions
                    m: number of samples
                    p: number of features
        train_lbl: train label
        score: scoring function to optimize model for (e.g. recall, f1)
        k: k value for k-fold cross validation
        num_cores: number of cores to use to fit the model

    Output:
        Randomforest model
    """

    model = RandomForestClassifier()
    param_grid = [
            {'n_estimators': [200, 300],
            'max_features': ['auto', 0.2, 0.4],
            'min_samples_leaf': [3,4],
                },
            ]

    logger = logging.getLogger('myLogger')

    logger.info("# Tuning hyperparameters for {s}".format(s=score))
    logger.info("\n")

    #print("# Tuning hyperparameters for {s}".format(s=score))
    #print()

    grid_search = GridSearchCV(model, param_grid, cv=k, scoring=score, refit=True,
        n_jobs=num_cores, verbose=1)
    grid_search.fit(train_data, np.ravel(train_lbl))

    #print("Best parameters set found on development set:")
    #print()
    #print(grid_search.best_params_)
    #print()
    #print("Grid scores on development set:")
    #print()

    logger.info("Best parameters set found on development set:")
    logger.info("\n")
    logger.info(grid_search.best_params_)
    logger.info("\n")
    logger.info("Grid scores on development set:")
    logger.info("\n")
    means = grid_search.cv_results_['mean_test_score']
    stds = grid_search.cv_results_['std_test_score']

    for mean, std, params in zip(means, stds, grid_search.cv_results_['params']):
        #print("%0.3f (+/-%0.03f) for %r" % (mean, std * 2, params))
        logger.info("%0.3f (+/-%0.03f) for %r" % (mean, std * 2, params))
    #print()
    logger.info("\n")
    final_model = grid_search.best_estimator_

    return final_model

def get_feature_importance(train_data, rf):
    """
    Get feature importance for randomforest model.

    Input:
        train_data: training data in pandas dataframe format
        rf: randomforest model fitted with sklearn module

    Output:
        Dataframe with feature importance sorted in descending orer
    """

    df = pd.DataFrame(rf.feature_importances_,
                    index=train_data.columns,
                    columns=['importance']).sort_values('importance',
                            ascending=False)

    return df
