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

module.exports = pointSystem
