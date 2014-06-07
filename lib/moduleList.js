// Never call this function. Required files are not resolved dynamically at run-
// time but have to be included statically at least once.

function moduleList()
{
  require("./modules/xssTest");
  require("./modules/xssReflectiveURL");
}