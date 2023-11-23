const express = require("express");
const app = express();
const tasksDetailsJson = require("./tasks/tasks.json");
const validator = require("./helpers/validator");
const fs = require("fs");
const path = require("path");
const { type } = require("os");
let writePath = path.join(__dirname, "./tasks/", "tasks.json");

let port = 3000;

app.use(express.json());

/** fetching list of tasks and filter using query parameter*/
app.get("/tasks", (req, res) => {
  const filter = req.query.filter;
  let filterVal = req.query.filterVal;
  if (!filter) {
    return res.status(200).send(tasksDetailsJson);
  }
  if (filter == "completion_status") filterVal = JSON.parse(filterVal);
  let filtered_data = tasksDetailsJson.filter(
    (val) => val[req.query.filter] == filterVal
  );

  return res.status(200).send(filtered_data);
});

/**fetching single task */
app.get("/tasks/:id", (req, res) => {
  let taskIdPassed = req.params.id;
  let result = tasksDetailsJson.filter((val) => val.id == taskIdPassed);
  return res.status(200).send(result);
});

/**create a task */
app.post("/tasks", (req, res) => {
  let taskDetails = req.body;
  let title = taskDetails.title.trim();
  let description = taskDetails.description.trim();
  if (
    validator.validateFields(title) &&
    validator.validateFields(description) &&
    validator.validateCompletionStatus(taskDetails.completion_status)
  ) {
    if (validator.validateTaskInfo(taskDetails, tasksDetailsJson)) {
      tasksDetailsJson.push(taskDetails);
      try {
        fs.writeFileSync(writePath, JSON.stringify(tasksDetailsJson), {
          encoding: "utf-8",
          flag: "w",
        });
        return res.status(200).send("Task added successfully");
      } catch {
        return res.status(500).send("Something failed on server side");
      }
    } else {
      return res.status(400).send("Request you send has something incorrect");
    }
  } else {
    return res.status(400).send("Request you send has something incorrect");
  }
});

/**update specfic task */
app.put("/tasks/:id", (req, res) => {
  let taskDetails = req.body;
  let taskIdPassed = req.params.id;
  let title = taskDetails.title.trim();
  let description = taskDetails.description.trim();
  let taskIdExist = tasksDetailsJson.filter((val) => val.id == taskIdPassed);
  if (taskIdExist.length === 0) {
    return res.status(400).send("Bad request");
  } else {
    if (
      validator.validateFields(title) &&
      validator.validateFields(description) &&
      validator.validateCompletionStatus(taskDetails.completion_status)
    ) {
      let index = tasksDetailsJson.findIndex((val) => val.id == taskIdPassed);
      tasksDetailsJson[index] = taskDetails;
      try {
        fs.writeFileSync(writePath, JSON.stringify(tasksDetailsJson), {
          encoding: "utf-8",
          flag: "w",
        });
        return res.status(200).send("Task updated successfully");
      } catch {
        return res.status(500).send("Something failed on server side");
      }
    } else {
      return res.status(400).send("Request you send has something incorrect");
    }
  }
});

/**deleting a task using specific taskId*/
app.delete("/tasks/:id", (req, res) => {
  let taskIdPassed = req.params.id;
  let index = tasksDetailsJson.findIndex((val) => val.id == taskIdPassed);
  tasksDetailsJson.splice(index);
  try {
    fs.writeFileSync(writePath, JSON.stringify(tasksDetailsJson), {
      encoding: "utf-8",
      flag: "w",
    });
    return res.status(200).send("Task deleted successfully");
  } catch {
    return res.status(500).send("Something failed on server side");
  }
});

/**retrieve tasks based on priority level */
app.get("/tasks/priority/:level", (req, res) => {
  let levelPassed = req.params.level;
  let result = tasksDetailsJson.filter((val) => val.priority == levelPassed);
  return res.status(200).send(result);
});

app.listen(port, (err) => {
  if (!err) {
    console.log(`server is running on port ${port}`);
  } else {
    console.log("some error encountered");
  }
});
