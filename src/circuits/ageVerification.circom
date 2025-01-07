pragma circom 2.1.6;

include "poseidon.circom";
include "comparators.circom";

template AgeVerification() {
    // Public inputs
    signal input threshold;
    signal input hash;
    
    // Private inputs
    signal input age;
    signal input secret;
    
    // Constraints
    component hasher = Poseidon(2);
    hasher.inputs[0] <== age;
    hasher.inputs[1] <== secret;
    hasher.out === hash;
    
    // Age verification using proper comparator
    component greaterEq = GreaterEqThan(252); // 252 bits is sufficient for age values
    greaterEq.in[0] <== age;
    greaterEq.in[1] <== threshold;
    greaterEq.out === 1; // Enforce age >= threshold
}
