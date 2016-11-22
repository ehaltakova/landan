package bg.nemetschek.landan.ui.index;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.google.gson.reflect.TypeToken;

import bg.nemetschek.landan.ui.Path;
import bg.nemetschek.landan.ui.util.AuthenticationUtil;
import bg.nemetschek.landan.ui.util.HTTPUtil;
import bg.nemetschek.landan.ui.util.ViewUtil;
import bg.nemetschek.landan.ui.util.HTTPUtil.HTTPResponse;
import bg.nemetschek.landan.ui.util.JsonUtil;
import spark.Request;
import spark.Response;
import spark.Route;

/**
 * Index page controller.
 * @author Elitza Haltakova
 *
 */
public class IndexController {

	public static Route serveIndexPage = (Request request, Response response) -> {
		
		Map<String, Object> model = new HashMap<>();
		Map<String, String> headers = new HashMap<String, String>();
		headers.put("Content-Type", "application/json");
		headers.put("charset", "utf-8");
		String gatesJson = HTTPUtil.getRequest("http://localhost:8888/api/gates", headers).body;
		List<Gate> gates = JsonUtil.fromJsonToType(gatesJson, new TypeToken<List<Gate>>(){}.getType());
		model.put("gates", gates);
		return ViewUtil.render(request, model, Path.Template.INDEX);
	};
	
	public static Route serveTestPage = (Request request, Response response) -> {
		
		response.header("Content-Type", "application/json");
		
		// headers
		Map<String, String> headers = new HashMap<String, String>();
		headers.put("Authorization", "Basic " + AuthenticationUtil.getBase64EncodedCredentialsDemoUser());
		headers.put("Content-Type", "application/json");
		headers.put("charset", "utf-8");
		
		HTTPResponse resp = HTTPUtil.getRequest("https://experts.nemetschek.bg/test-jira/rest/api/2/issue/ATC-4", headers);
		return resp.body;
	};
}
