import json
import ToolFunc as tool
from scipy.optimize import basinhopping
import numpy as np
import matplotlib.pyplot as plt

# Opening JSON file
f = open("canvas.json")

# returns JSON object as
# a dictionary
data = json.load(f)


def scale_objective(scale, weight, canvas_info, save_info_scale, origin_info, draw):
    print("++++++++", scale)
    scaling = scale[0]
    info_scale = tool.scaleRegions(
        canvas_info["width"], canvas_info["height"], origin_info, scaling
    )
    save_info_scale["scale_" + str(scaling)] = {"info": info_scale}
    save_info_scale["scale_" + str(scaling)]["penalty"] = {}
    # MIN_C, MIN_SCORE = find_leaf_placement(info_scale, weight)
    MIN_C, MIN_SCORE = tool.optimization(
        info_scale, weight, save_info_scale["scale_" + str(scaling)]["penalty"], draw
    )
    min_score = sum(MIN_SCORE)
    print("score: ", sum(MIN_SCORE))
    # for multiple insights, put it to the "smallest penalty" insight
    # min_c = MIN_C[np.argmin(MIN_SCORE)]
    save_info_scale["scale_" + str(scaling)]["center"] = MIN_C
    save_info_scale["scale_" + str(scaling)]["score"] = MIN_SCORE
    draw["all"].append(sum(MIN_SCORE))
    return min_score


def optimal_scale_placement(canvas_info, weight, draw):
    save_info_scale = {}
    origin_info = {
        "shape_regions": [],
        "alpha_regions": [],
        "insights": canvas_info["insights"],
    }

    for i in range(0, len(canvas_info["regions"])):
        origin_info["shape_regions"].append(canvas_info["regions"][i]["points"])
        origin_info["alpha_regions"].append(canvas_info["regions"][i]["alpha"])
    # initial state 0.9, give bound of 0.8, 1.0 and find global minimum in bound
    x0 = [0.9]
    minimizer_kwargs = dict(
        method="L-BFGS-B",
        bounds=[(0.8, 1.0)],
        tol=1e-3,
        args=(weight, canvas_info, save_info_scale, origin_info, draw),
    )
    # basin hopping: Find the global minimum of a objective function using the basin-hopping algorithm.
    result = basinhopping(
        scale_objective,
        x0,
        minimizer_kwargs=minimizer_kwargs,
        stepsize=0.25,
        niter=20,
        niter_success=2,
    )
    print("global minimum: x = %.4f, f(x) = %.4f" % (result.x, result.fun))
    # return best_scale, best_scale_pos

    with open("info_scale.json", "w", encoding="utf-8") as f:
        json.dump(save_info_scale, f, ensure_ascii=False, indent=4)
    return result.x[0], save_info_scale["scale_" + str(result.x[0])]["center"]

    # print("++++++++++++", save_info_scale["scale_"+str(result.x[0])])


def old_optimal_scale_placement(canvas_info, weight):
    save_info_scale = {}
    scale_hyperparam = [1, 0.95, 0.9, 0.85, 0.8]

    best_score, best_scale, best_scale_pos = float("inf"), 1, None
    origin_info = {
        "shape_regions": [],
        "alpha_regions": [],
        "insights": canvas_info["insights"],
    }

    for i in range(0, len(canvas_info["regions"])):
        origin_info["shape_regions"].append(canvas_info["regions"][i]["points"])
        origin_info["alpha_regions"].append(canvas_info["regions"][i]["alpha"])

    for scaling in scale_hyperparam:
        print("scale: ", scaling)
        info_scale = tool.scaleRegions(
            canvas_info["width"], canvas_info["height"], origin_info, scaling
        )
        save_info_scale["scale_" + str(scaling)] = {"info": info_scale}

        # MIN_C, MIN_SCORE = find_leaf_placement(info_scale, weight)
        MIN_C, MIN_SCORE = tool.optimization(info_scale, weight)

        save_info_scale["scale_" + str(scaling)]["center"] = MIN_C
        save_info_scale["scale_" + str(scaling)]["score"] = MIN_SCORE

        print("scale Penalty:", sum(MIN_SCORE))
        print()
        if sum(MIN_SCORE) * (2 - scaling * scaling) < best_score:
            best_score = sum(MIN_SCORE) * (2 - scaling * scaling)
            best_scale = scaling
            best_scale_pos = MIN_C
    print("best: ", best_score)
    with open("old_info_scale.json", "w") as f:
        json.dump(save_info_scale, f)
    print(MIN_SCORE)
    return best_scale, best_scale_pos


weight = 1
canvas_info = data
draw = {"all": [], "AABB": [], "Distance": [], "AABB_draw": [], "Dis_draw": []}
print(optimal_scale_placement(canvas_info, weight, draw))
for i in range(len(draw["all"])):
    draw["AABB_draw"].append(
        draw["AABB"][i * 3] + draw["AABB"][i * 3 + 1] + draw["AABB"][i * 3 + 2]
    )
    draw["Dis_draw"].append(
        draw["Distance"][i * 3]
        + draw["Distance"][i * 3 + 1]
        + draw["Distance"][i * 3 + 2]
    )
draw_x = []
for i in range(len(draw["all"])):
    draw_x.append(i)

plt.plot(draw_x, draw["AABB_draw"], label="AABB")
plt.plot(draw_x, draw["Dis_draw"], label="Distance")
plt.plot(draw_x, draw["all"], label="total")
leg = plt.legend(loc="upper center")
plt.show()
f.close()
