/**
 * @constructor
 * @param {M3ParserBinaryReader} reader
 * @param {number} version
 * @param {Array<M3ParserIndexEntry>} index
 */
function M3ParserBone(reader, version, index) {
    /** @member {number} */
    this.version = version;
    /** @member {number} */
    this.unknown0 = reader.readInt32();
    /** @member {M3ParserReference} */
    this.name = new M3ParserReference(reader, index);
    /** @member {number} */
    this.flags = reader.readUint32();
    /** @member {number} */
    this.parent = reader.readInt16();
    /** @member {number} */
    this.unknown1 = reader.readUint16();
    /** @member {M3ParserVector3AnimationReference} */
    this.location = new M3ParserVector3AnimationReference(reader);
    /** @member {M3ParserVector4AnimationReference} */
    this.rotation = new M3ParserVector4AnimationReference(reader);
    /** @member {M3ParserVector3AnimationReference} */
    this.scale = new M3ParserVector3AnimationReference(reader);
    /** @member {M3ParserUint32AnimationReference} */
    this.visibility = new M3ParserUint32AnimationReference(reader);
}