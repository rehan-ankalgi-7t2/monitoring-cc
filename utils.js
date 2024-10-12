function getRandomValue(arr) {
    if (arr.length === 0) return 1; // Handle empty array case
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
}

function doSomeHeavyTask() {
    const ms = getRandomValue([100, 200, 300, 400, 500, 1000, 2500])
    const shouldThrowError = getRandomValue([1, 2, 3, 4, 5, 6, 7, 8]) === 8;

    if(shouldThrowError){
        const randomError = getRandomValue(['Payment failed', 'Server not available', 'Access Denied', 'Resource Not Found']);
        throw new Error(randomError);
    }

    return new Promise((resolve, reject) => setTimeout(() => resolve(ms), ms))
}

module.exports  = {
    doSomeHeavyTask
}