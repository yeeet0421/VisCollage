import json
from ToolFunc import optimization, scaleRegions
from scipy.optimize import basinhopping, dual_annealing
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import imageio

# Opening JSON file
f = open("canvas.json")

# returns JSON object as
# a dictionary
data = json.load(f)


def scale_objective(scale, weight, canvas_info, save_info_scale, origin_info, draw):
    print("++++++++", scale)
    scaling = scale[0]
    info_scale = scaleRegions(
        canvas_info["width"], canvas_info["height"], origin_info, scaling
    )
    save_info_scale["scale_" + str(scaling)] = {"info": info_scale}
    save_info_scale["scale_" + str(scaling)]["penalty"] = {}
    # MIN_C, MIN_SCORE = find_leaf_placement(info_scale, weight)
    MIN_C, MIN_SCORE = optimization(
        info_scale, weight, save_info_scale["scale_" + str(scaling)]["penalty"], draw
    )
    min_score = sum(MIN_SCORE)
    print("score: ", sum(MIN_SCORE))
    # for multiple insights, put it to the "smallest penalty" insight
    # min_c = MIN_C[np.argmin(MIN_SCORE)]
    save_info_scale["scale_" + str(scaling)]["center"] = MIN_C
    save_info_scale["scale_" + str(scaling)]["score"] = MIN_SCORE
    draw["all"].append(sum(MIN_SCORE))
    draw["scale"].append(scaling)
    draw["place"].append(MIN_C)
    return min_score

    # continuous attempt


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
    # print("++++++++++++", save_info_scale["scale_"+str(result.x[0])])
    with open("info_scale.json", "w", encoding="utf-8") as f:
        json.dump(save_info_scale, f, ensure_ascii=False, indent=4)
    return result.x[0], save_info_scale["scale_" + str(result.x[0])]["center"]

    # def optimal_scale_placement(canvas_info, weight, draw):
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
        save_info_scale["scale_" + str(scaling)]["penalty"] = {}
        # MIN_C, MIN_SCORE = find_leaf_placement(info_scale, weight)
        MIN_C, MIN_SCORE = tool.optimization(
            info_scale,
            weight,
            save_info_scale["scale_" + str(scaling)]["penalty"],
            draw,
        )

        save_info_scale["scale_" + str(scaling)]["center"] = MIN_C
        save_info_scale["scale_" + str(scaling)]["score"] = MIN_SCORE

        print("scale Penalty:", sum(MIN_SCORE))
        print()
        if sum(MIN_SCORE) * (2 - scaling * scaling) < best_score:
            best_score = sum(MIN_SCORE) * (2 - scaling * scaling)
            best_scale = scaling
            best_scale_pos = MIN_C
        draw["all"].append(sum(MIN_SCORE))
    # print("best: ", best_score)
    with open("old_info_scale.json", "w") as f:
        json.dump(save_info_scale, f)
    # print(MIN_SCORE)

    return best_scale, best_scale_pos


weight = 1
canvas_info = data
draw = {"all": [], "AABB": [], "Distance": [], "AABB_draw": [], "Dis_draw": [], 'scale': [], 'place': []}
print(optimal_scale_placement(canvas_info, weight, draw))

# for i in range(len(draw["all"])):
#     draw["AABB_draw"].append(
#         draw["AABB"][i * 3] + draw["AABB"][i * 3 + 1] + draw["AABB"][i * 3 + 2]
#     )
#     draw["Dis_draw"].append(
#         draw["Distance"][i * 3]
#         + draw["Distance"][i * 3 + 1]
#         + draw["Distance"][i * 3 + 2]
#     )
# draw_x = []
# for i in range(len(draw["all"])):
#     draw_x.append(i)
# print(draw)
# # plt.plot(draw_x, draw["AABB_draw"], label="AABB", alpha=0.8)
# # plt.plot(draw_x, draw["Dis_draw"], label="Distance", alpha=0.8)
# # plt.plot(draw_x, draw["all"], label="total", alpha=0.8)
# # leg = plt.legend(loc="best")
# # plt.xlabel("Iterations")
# # plt.ylabel("Penalty")
# # # plt.ylim([-20, 1850])
# # plt.show()
# # f.close()

for place in range(len(draw['place'])):
    fig = plt.figure()
    ax = fig.add_subplot(111)
    # fig, ax = plt.subplots()
    # ax.plot([0, canvas_info["width"]], [0, canvas_info["height"]])
    for i in canvas_info["regions"]:
        # print(
        #     (i["points"][0], i["points"][1]),
        #     i["points"][2],
        #     i["points"][3],
        # )
        rect = patches.Rectangle(
            (i["points"][0], i["points"][1]),
            i["points"][2],
            i["points"][3],
        )
        ax.add_patch(rect)
    for i in draw['place'][place]:
        # print(i)
        rect = patches.Rectangle(
            (i[0], i[1]),
            150,
            300,
            facecolor = 'none',
            edgecolor = 'red'
        )
        ax.add_patch(rect)
    plt.title(str('scale: '+draw['scale'][place]))
    plt.xlim([0, canvas_info["width"]])
    plt.ylim([0, canvas_info["height"]])
    plt.gca().invert_yaxis()
    # plt.show()
    plt.savefig(f'./tmp/{place}.png')
    plt.close()
# 生成gif
with imageio.get_writer('mygif.gif', mode='I') as writer:
    for i in range(len(draw['place'])):
        filename = './tmp/'+str(i)+'.png'
        image = imageio.imread(filename)
        writer.append_data(image)

# # 刪除20張柱狀圖
# for filename in set(filenames):
#     os.remove(filename)