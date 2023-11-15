export const isRemainingTime = (timeRemaining: number) => {
    return new Date().getTime() < timeRemaining * 1000;
}