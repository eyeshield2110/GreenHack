function pointSystem(level)  {
    let goal = 1
    if (level === 1)
        goal = 2
    else if (level === 2)
        goal = 10
    else if (level === 3)
        goal = 25
    else if (level === 4)
        goal = 50
    else if (level === 5)
        goal = 85
    else if (level > 5)
        goal = 100
    return goal
}
function newLevel(points) {
    let level = 0
    if (points < 1)
        level = 0
    else if (points < 2)
        level = 1
    else if (points < 10)
        level = 2
    else if (points < 25)
        level = 3
    else if (points < 50)
        level = 4
    else if (points < 85)
        level = 5
    else if (points < 100)
        level = 9
    return level
}

module.exports = {
    pointSystem,
    newLevel
}
