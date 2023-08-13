// https://stackoverflow.com/questions/14446511/most-efficient-method-to-groupby-on-an-array-of-objects
const _groupBy = (x, f) => x.reduce(
    (a, b) => (
        (a[f(b)] ||= []).push(b), a
    ),
    {}
)	

export function processCommuteStats(commuteStats: Document[]) {
    // Group all of the unprocessed commutes by city pairs
    const groupedCommuteStats = _groupBy(
        commuteStats, 
        (ele: Document) => ele.origin + '-' + ele.destination
    );

    return groupedCommuteStats;
}