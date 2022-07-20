def get_reduced_matrix(method):
    if(method == 'diamond'):
        map_table = {'a':['K','R','E','D','Q','N'],
                         'b':['C'],
                         'c':['G'],
                         'd':['H'],
                         'e':['I','L','V'],
                         'f':['M'],
                         'g':['F'],
                         'h':['Y'],
                         'i':['W'],
                         'j':['P'],
                         'k':['S','T','A']}

    elif(method == 'dayhoff'):
        map_table = {'k':['A','G','P','S','T'],
                         'l':['C'],
                         'm':['F','W','Y'],
                         'n':['H','R','K'],
                         'o':['M','I','L','F'],
                         'p':['N','D','E','Q']}

    elif(method == 'murphy_4'):
        map_table = {'w':['L','V','I','M','C'],
                         'x':['A','G','S','T','P'],
                         'y':['F','Y','W'],
                         'z':['E','D','N','Q','K','R','H']}

    elif(method == 'murphy_8'):
        map_table = {'0':['L','V','I','M','C'],
                         '1':['A','G'],
                         '2':['S','T'],
                         '3':['P'],
                         '4':['F','Y','W'],
                         '5':['E','D','N','Q'],
                         '6':['K','R'],
                         '7':['H']}

    elif(method == 'murphy_10'):
        map_table = {'a':['L','V','I','M'],
                         'b':['C'],
                         'c':['A'],
                         'd':['G'],
                         'e':['S','T'],
                         'f':['P'],
                         'g':['F','Y','W'],
                         'h':['E','D','N','Q'],
                         'i':['K','R'],
                         'j':['H']}

    else:
        sys.exit("No amino acid reduction representation is selected!")

    return map_table
