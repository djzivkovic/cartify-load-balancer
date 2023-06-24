export function GCD(arr) // Return GCD of N numbers
{
    function gcd(a, b) // Return GCD of 2 numbers
    {
        if (a == 0)
            return b;
        return gcd(b % a, a);
    }
    if(arr.length == 0) return NaN;
    let result = arr[0];
    for (let i = 1; i < arr.length; i++)
    {
        result = gcd(arr[i], result);
        if(result == 1)
            return 1;
    }
    return result;
}