PGDMP     2                    {           gisdb "   11.20 (Ubuntu 11.20-1.pgdg20.04+1)    15.1                0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false                       0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false                       0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false                       1262    16394    gisdb    DATABASE     q   CREATE DATABASE gisdb WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.UTF-8';
    DROP DATABASE gisdb;
                postgres    false                       0    0    DATABASE gisdb    ACL     N   GRANT ALL ON DATABASE gisdb TO ldc2;
GRANT ALL ON DATABASE gisdb TO tall_get;
                   postgres    false    4892                       0    0    gisdb    DATABASE PROPERTIES     �   ALTER DATABASE gisdb SET search_path TO 'postgis', 'public';
ALTER DATABASE gisdb SET "postgis.gdal_enabled_drivers" TO 'GTiff';
ALTER DATABASE gisdb SET "postgis.enable_outdb_rasters" TO 'on';
                     postgres    false            �            1259    18306    cdnp_boundary_wgs84    TABLE     �   CREATE TABLE gis.cdnp_boundary_wgs84 (
    gid integer NOT NULL,
    id bigint,
    name character varying(10),
    area numeric,
    hectare bigint,
    acre bigint,
    geom postgis.geometry(MultiPolygon,4326)
);
 $   DROP TABLE gis.cdnp_boundary_wgs84;
       gis            elrey    false                       0    0    TABLE cdnp_boundary_wgs84    ACL     4   GRANT ALL ON TABLE gis.cdnp_boundary_wgs84 TO ldc2;
          gis          elrey    false    247            �            1259    18304    cdnp_boundary_wgs84_gid_seq    SEQUENCE     �   CREATE SEQUENCE gis.cdnp_boundary_wgs84_gid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE gis.cdnp_boundary_wgs84_gid_seq;
       gis          elrey    false    247                        0    0    cdnp_boundary_wgs84_gid_seq    SEQUENCE OWNED BY     U   ALTER SEQUENCE gis.cdnp_boundary_wgs84_gid_seq OWNED BY gis.cdnp_boundary_wgs84.gid;
          gis          elrey    false    246            !           0    0 $   SEQUENCE cdnp_boundary_wgs84_gid_seq    ACL     ?   GRANT ALL ON SEQUENCE gis.cdnp_boundary_wgs84_gid_seq TO ldc2;
          gis          elrey    false    246            �           2604    18309    cdnp_boundary_wgs84 gid    DEFAULT     |   ALTER TABLE ONLY gis.cdnp_boundary_wgs84 ALTER COLUMN gid SET DEFAULT nextval('gis.cdnp_boundary_wgs84_gid_seq'::regclass);
 C   ALTER TABLE gis.cdnp_boundary_wgs84 ALTER COLUMN gid DROP DEFAULT;
       gis          elrey    false    247    246    247                      0    18306    cdnp_boundary_wgs84 
   TABLE DATA           T   COPY gis.cdnp_boundary_wgs84 (gid, id, name, area, hectare, acre, geom) FROM stdin;
    gis          elrey    false    247   i       "           0    0    cdnp_boundary_wgs84_gid_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('gis.cdnp_boundary_wgs84_gid_seq', 1, true);
          gis          elrey    false    246            �           2606    18314 ,   cdnp_boundary_wgs84 cdnp_boundary_wgs84_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY gis.cdnp_boundary_wgs84
    ADD CONSTRAINT cdnp_boundary_wgs84_pkey PRIMARY KEY (gid);
 S   ALTER TABLE ONLY gis.cdnp_boundary_wgs84 DROP CONSTRAINT cdnp_boundary_wgs84_pkey;
       gis            elrey    false    247            �           1259    18315    cdnp_boundary_wgs84_geom_idx    INDEX     X   CREATE INDEX cdnp_boundary_wgs84_geom_idx ON gis.cdnp_boundary_wgs84 USING gist (geom);
 -   DROP INDEX gis.cdnp_boundary_wgs84_geom_idx;
       gis            elrey    false    247               �   x��λ�@��T�f�B�A�q�K>'���� �����l,�оR'ÜZW���`��!��ɷ�f�nlVR
g�&A���;HM��|t���<p�9�5������TtwJ���RD�����@L(�4�N�ۥ:Bԩ�}�4ɤ���-�uY�7�]<     