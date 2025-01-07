pragma circom 2.1.6;

include "poseidon.circom";
include "comparators.circom";
include "./ageVerification.circom";

template MultiAttributeVerification() {
    // Public inputs
    signal input ageThreshold;
    signal input incomeThreshold;
    signal input residencyHash;
    
    // Private inputs
    signal input age;
    signal input income;
    signal input residency;
    signal input secret;
    
    // Age verification
    component ageVerifier = AgeVerification();
    ageVerifier.age <== age;
    ageVerifier.threshold <== ageThreshold;
    ageVerifier.secret <== secret;
    ageVerifier.hash <== residencyHash;
    
    // Income verification using proper comparator
    component incomeCheck = GreaterEqThan(252);
    incomeCheck.in[0] <== income;
    incomeCheck.in[1] <== incomeThreshold;
    incomeCheck.out === 1;
    
    // Residency verification
    component residencyHasher = Poseidon(2);
    residencyHasher.inputs[0] <== residency;
    residencyHasher.inputs[1] <== secret;
    residencyHasher.out === residencyHash;
}

component main {public [ageThreshold, incomeThreshold, residencyHash]} = MultiAttributeVerification();