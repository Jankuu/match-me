package com.example.demo.utilities;

import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;

// just for a static method to create Point coordinates from lng and lat
public class GeometryUtils {
    private static final GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);

    public static Point createPoint(double lng, double lat) {
        return geometryFactory.createPoint(new Coordinate(lng, lat));
    }
}
