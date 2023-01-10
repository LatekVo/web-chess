// NOTE: this is 100% duplicate code for development purposes only, more details @ constants.js:1:1

// mostly functions copied from the server.js
// they are lengthy and I don't want to clutter up main.js file

// if everything works correctly, copy 'checkMove' here for client-side's use

function getColor(piece_id) {
    if (piece_id < 0)
        return pe.BLANK

    if (piece_id < pe.B_K)
        return pe.WHITE

    return pe.BLACK
}

function castRay(initElement) {
    let x = initElement.dataset.x,
        y = initElement.dataset.y

    let pieceId = localPlayingField[y][x]

    let pieceIt = -1
    let isPosBased = false
    for (let i = 0; i < mov_vel_list.length; i++) {
        if (mov_vel_list[i].pieces === pieceId)
            pieceIt = i
    }
    for (let i = 0; i < mov_pos_list.length; i++) {
        if (mov_pos_list[i].pieces === pieceId) {
            pieceIt = i
            isPosBased = true
        }
    }

    if (!isPosBased) {
        // CAST A RAY

    } else {
        // DOT EVERY POSITION

    }

}

/// FOLLOWING CODE IS UP TO CHANGE, NOT FULLY TESTED YET - CURRENTLY BEING TESTED
/// REMEMBER TO SYNC THIS, AND SERVER SIDE CODE

function checkMove(f_x, f_y, t_x, t_y) {
    let board = localPlayingField

    console.log(f_x + ' ' + f_y)
    console.log(board)

    let pieceId = board[f_y][f_x]
    let pieceCol = getColor(pieceId)

    // CHECK FOR POSSIBILITY OF A MOVE
    // ray-cast - check for obstacles
    // pos-check - check for friendlies at the destination

    // find piece's iterator in the mov_vel_list or mov_pos_list
    let pieceIt = -1
    let isPosBased = false
    for (let i = 0; i < mov_vel_list.length; i++) {
        if (mov_vel_list[i].pieces === pieceId)
            pieceIt = i
    }
    for (let i = 0; i < mov_pos_list.length; i++) {
        if (mov_pos_list[i].pieces === pieceId) {
            pieceIt = i
            isPosBased = true
        }
    }

    // error, request corrupted, the square is blank
    if (pieceIt === -1) {
        return boardState.INVALID
    }

    let isMovePossible = false

    // ray-cast
    if (!isPosBased) {

        let vel_x = 0,
            vel_y = 0

        // x - find the correct vector
        if (f_x >= t_x) vel_x = -1
        if (f_x <= t_x) vel_x = 1

        if (f_y >= t_y) vel_y = -1
        if (f_y <= t_y) vel_y = 1


        let ray = {x: f_x, y: f_y}

        // cast the ray
        for (let i = 0; i < 8; i++) {

            // iterate the ray
            ray.x += vel_x
            ray.y += vel_y

            // check for: not being out of bounds
            if (!(0 < ray.x && ray.x < 7) || !(0 < ray.y && ray.y < 7))
                break


            /* reached destination, and enemy is the opposite color */
            if (f_x === t_x && f_y === t_y) {
                isMovePossible = true
            }

            // check for: line of sight
            if (board[ray.y][ray.x] !== pe.BLANK)
                break

        }

    } else /* (isPosBased) */ {
        // vec from f to t
        let mask_x = t_x - f_x,
            mask_y = t_y - f_y

        // and just check if there exists a fitting mask for such a move
        for (let i = 0; i < mov_pos_list[pieceIt].positions.length; i++) {
            if (mask_x === mov_pos_list[pieceIt].positions[i].x &&
                mask_y === mov_pos_list[pieceIt].positions[i].y) {

                isMovePossible = true
                break
            }
        }
    }

    // move will be impossible if both pieces are the same color
    if (pieceCol === getColor(board[t_y][t_x])) {
        isMovePossible = false
    }

    // CHECK FOR A MATE
    // * find kings
    // * cast horizontal, vertical and diagonal rays from the king
    // * if there is an attacking element in the way of the ray, announce a check
    // * only way to lose (for simplicity) is to resign, so if the king can't move, he needs to resign.
    // ? why is that? besides checking for king's space, I would need to check if any piece can get in the way of ray
    // ? and that will be complicated.

    let white_king, black_king

    // find coords of the kings
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            if (board[y][x] === pe.W_K) {
                white_king = {x: x, y: y}
            }
            if (board[y][x] === pe.B_K) {
                black_king = {x: x, y: y}
            }
        }
    }

    let isWhiteMated = false;
    let isBlackMated = false;

    // RAY-CAST CHECK FOR A MATE
    for (let caseId = 0; caseId < atk_vel_list.length; caseId++) {
        for (let velocityId = 0; velocityId < atk_vel_list[caseId].velocities.length; velocityId++) {
            let wStopRay = false, bStopRay = false

            let vel_x = atk_vel_list[caseId].velocities[velocityId][0],
                vel_y = atk_vel_list[caseId].velocities[velocityId][1]

            // cast a ray
            for (let i = 0, ray_w = white_king, ray_b = black_king; i < 8; i++) {

                // iterate the ray
                ray_w.x += vel_x
                ray_w.y += vel_y
                ray_b.x += vel_x
                ray_b.y += vel_y

                // check for: not being out of bounds
                if (!(0 < ray_w.x && ray_w.x < 7) || !(0 < ray_w.y && ray_w.y < 7))
                    wStopRay = true;

                if (!(0 < ray_b.x && ray_b.x < 7) || !(0 < ray_b.y && ray_b.y < 7))
                    bStopRay = true;

                // check for the piece attacking a king
                for (let pieceId = 0; pieceId < atk_vel_list[caseId].pieces.length; pieceId++) {
                    if (wStopRay === false && board[ray_w.y][ray_w.x] === atk_vel_list[caseId].pieces[pieceId]) {
                        isWhiteMated = true;
                        wStopRay = true;
                    }
                    if (bStopRay === false && board[ray_b.y][ray_b.x] === atk_vel_list[caseId].pieces[pieceId]) {
                        isBlackMated = true;
                        bStopRay = true;
                    }
                }

                // check for: line of sight
                if (board[ray_w.y][ray_w.x] !== pe.BLANK)
                    wStopRay = true;

                if (board[ray_b.y][ray_b.x] !== pe.BLANK)
                    bStopRay = true;

            }

        }

    }

    // POSITION CHECK FOR A MATE - this loop needs to be separate, as it looks at points, not rays
    for (let caseId = 0; caseId < atk_pos_list.length; caseId++) {
        for (let positionId = 0; positionId < atk_pos_list[caseId].positions.length; positionId++) {
            let wStopChecking = false
            let bStopChecking = false

            // set the checked point
            let point_w = {
                    x: white_king.x + atk_pos_list[caseId].positions[positionId][0],
                    y: white_king.y + atk_pos_list[caseId].positions[positionId][1]
                },
                point_b = {
                    x: black_king.x + atk_pos_list[caseId].positions[positionId][0],
                    y: black_king.y + atk_pos_list[caseId].positions[positionId][1]
                }
            // check for: not being out of bounds
            if (!(0 < point_w.x && point_w.x < 7) || !(0 < point_w.y && point_w.y < 7))
                wStopChecking = true

            if (!(0 < point_b.x && point_b.x < 7) || !(0 < point_b.y && point_b.y < 7))
                bStopChecking = true

            for (let pieceId = 0; pieceId < atk_pos_list[caseId].pieces.length; pieceId++) {
                if (wStopChecking === false && board[point_w.y][point_w.x] === atk_pos_list[caseId].pieces[pieceId]) {
                    isWhiteMated = true
                }
                if (bStopChecking === false && board[point_b.y][point_b.x] === atk_pos_list[caseId].pieces[pieceId]) {
                    isBlackMated = true
                }
            }
        }
    }

    // to check for lock (game over):
    /* - check every possible king's move
    *  - have an attacking ray, check if anything can move into it
    *  - if there are multiple rays, it's an outright loss
    * */
    let isWhiteLocked = false
    let isBlackLocked = false

    // todo: besides checking for check, see if it's possible to escape this check, or to block it.
    // only calculated to reassure either isWhiteMated or isBlackMated, either of them has to be true

    if (!isMovePossible)
        return boardState.INVALID

    let output = boardState.UNRESOLVED

    if (isWhiteMated)
        output = boardState.WHITE_CHECKD

    if (isBlackMated)
        output = boardState.BLACK_CHECKD

    if (isWhiteLocked)
        output = boardState.BLACK_WIN

    if (isBlackLocked)
        output = boardState.WHITE_WIN

    if (isWhiteMated && isBlackMated)
        output = boardState.INVALID

    console.log('move check OK: code ' + output)
    return output;
}