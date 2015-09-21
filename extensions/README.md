# extensions/

This folder should only be used to extend JavaScript's built in Prototypes.

Please extend with care, and don't extend the Object prototype, as that could screw with `for in` loops. In fact it may make more sense in future versions to move these to utility functions.
