package bg.nemetschek.landan.ui.index;

/** 
 * Gate model class.
 * @author Elitza Haltakova
 *
 */
public class Gate {

	private long id;
	private String name;
	private String coordinates;

	public Gate() {
		super();
	}

	public long getId() {
		return this.id;
	}

	public String getName() {
		return this.name;
	}

	public String getCoordinates() {
		return this.coordinates;
	}
}