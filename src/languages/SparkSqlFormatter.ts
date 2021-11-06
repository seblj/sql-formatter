import Formatter from '../core/Formatter';
import Tokenizer from '../core/Tokenizer';
import { isToken, Token, TokenType } from '../core/token'; // convert to partial type import in TS 4.5
import type { StringPatternType } from '../core/regexFactory';

/**
 * Priority 5 (last)
 * Full list of reserved functions
 * distinct from Keywords due to interaction with parentheses
 */
// http://spark.apache.org/docs/latest/sql-ref-functions.html
const reservedFunctions = {
	// http://spark.apache.org/docs/latest/sql-ref-functions-builtin.html#aggregate-functions
	aggregate: [
		'ANY',
		'APPROX_COUNT_DISTINCT',
		'APPROX_PERCENTILE',
		'AVG',
		'BIT_AND',
		'BIT_OR',
		'BIT_XOR',
		'BOOL_AND',
		'BOOL_OR',
		'COLLECT_LIST',
		'COLLECT_SET',
		'CORR',
		'COUNT',
		'COUNT',
		'COUNT',
		'COUNT_IF',
		'COUNT_MIN_SKETCH',
		'COVAR_POP',
		'COVAR_SAMP',
		'EVERY',
		'FIRST',
		'FIRST_VALUE',
		'GROUPING',
		'GROUPING_ID',
		'KURTOSIS',
		'LAST',
		'LAST_VALUE',
		'MAX',
		'MAX_BY',
		'MEAN',
		'MIN',
		'MIN_BY',
		'PERCENTILE',
		'PERCENTILE',
		'PERCENTILE_APPROX',
		'SKEWNESS',
		'SOME',
		'STD',
		'STDDEV',
		'STDDEV_POP',
		'STDDEV_SAMP',
		'SUM',
		'VAR_POP',
		'VAR_SAMP',
		'VARIANCE',
	],
	// http://spark.apache.org/docs/latest/sql-ref-functions-builtin.html#window-functions
	window: [
		'CUME_DIST',
		'DENSE_RANK',
		'LAG',
		'LEAD',
		'NTH_VALUE',
		'NTILE',
		'PERCENT_RANK',
		'RANK',
		'ROW_NUMBER',
	],
	// http://spark.apache.org/docs/latest/sql-ref-functions-builtin.html#array-functions
	array: [
		'ARRAY',
		'ARRAY_CONTAINS',
		'ARRAY_DISTINCT',
		'ARRAY_EXCEPT',
		'ARRAY_INTERSECT',
		'ARRAY_JOIN',
		'ARRAY_MAX',
		'ARRAY_MIN',
		'ARRAY_POSITION',
		'ARRAY_REMOVE',
		'ARRAY_REPEAT',
		'ARRAY_UNION',
		'ARRAYS_OVERLAP',
		'ARRAYS_ZIP',
		'FLATTEN',
		'SEQUENCE',
		'SHUFFLE',
		'SLICE',
		'SORT_ARRAY',
	],
	// http://spark.apache.org/docs/latest/sql-ref-functions-builtin.html#map-functions
	map: [
		'ELEMENT_AT',
		'ELEMENT_AT',
		'MAP',
		'MAP_CONCAT',
		'MAP_ENTRIES',
		'MAP_FROM_ARRAYS',
		'MAP_FROM_ENTRIES',
		'MAP_KEYS',
		'MAP_VALUES',
		'STR_TO_MAP',
	],
	// http://spark.apache.org/docs/latest/sql-ref-functions-builtin.html#date-and-timestamp-functions
	datetime: [
		'ADD_MONTHS',
		'CURRENT_DATE',
		'CURRENT_DATE',
		'CURRENT_TIMESTAMP',
		'CURRENT_TIMESTAMP',
		'CURRENT_TIMEZONE',
		'DATE_ADD',
		'DATE_FORMAT',
		'DATE_FROM_UNIX_DATE',
		'DATE_PART',
		'DATE_SUB',
		'DATE_TRUNC',
		'DATEDIFF',
		'DAY',
		'DAYOFMONTH',
		'DAYOFWEEK',
		'DAYOFYEAR',
		'EXTRACT',
		'FROM_UNIXTIME',
		'FROM_UTC_TIMESTAMP',
		'HOUR',
		'LAST_DAY',
		'MAKE_DATE',
		'MAKE_DT_INTERVAL',
		'MAKE_INTERVAL',
		'MAKE_TIMESTAMP',
		'MAKE_YM_INTERVAL',
		'MINUTE',
		'MONTH',
		'MONTHS_BETWEEN',
		'NEXT_DAY',
		'NOW',
		'QUARTER',
		'SECOND',
		'SESSION_WINDOW',
		'TIMESTAMP_MICROS',
		'TIMESTAMP_MILLIS',
		'TIMESTAMP_SECONDS',
		'TO_DATE',
		'TO_TIMESTAMP',
		'TO_UNIX_TIMESTAMP',
		'TO_UTC_TIMESTAMP',
		'TRUNC',
		'UNIX_DATE',
		'UNIX_MICROS',
		'UNIX_MILLIS',
		'UNIX_SECONDS',
		'UNIX_TIMESTAMP',
		'WEEKDAY',
		'WEEKOFYEAR',
		'WINDOW',
		'YEAR',
	],
	// http://spark.apache.org/docs/latest/sql-ref-functions-builtin.html#json-functions
	json: [
		'FROM_JSON',
		'GET_JSON_OBJECT',
		'JSON_ARRAY_LENGTH',
		'JSON_OBJECT_KEYS',
		'JSON_TUPLE',
		'SCHEMA_OF_JSON',
		'TO_JSON',
	],
	// http://spark.apache.org/docs/latest/api/sql/index.html
	misc: [
		'ABS',
		'ACOS',
		'ACOSH',
		'AGGREGATE',
		'ARRAY_SORT',
		'ASCII',
		'ASIN',
		'ASINH',
		'ASSERT_TRUE',
		'ATAN',
		'ATAN2',
		'ATANH',
		'BASE64',
		'BIGINT',
		'BIN',
		'BINARY',
		'BIT_COUNT',
		'BIT_GET',
		'BIT_LENGTH',
		'BOOLEAN',
		'BROUND',
		'BTRIM',
		'CARDINALITY',
		'CBRT',
		'CEIL',
		'CEILING',
		'CHAR',
		'CHAR_LENGTH',
		'CHARACTER_LENGTH',
		'CHR',
		'CONCAT',
		'CONCAT_WS',
		'CONV',
		'COS',
		'COSH',
		'COT',
		'CRC32',
		'CURRENT_CATALOG',
		'CURRENT_DATABASE',
		'CURRENT_USER',
		'DATE',
		'DECIMAL',
		'DEGREES',
		'DOUBLE',
		// 'E',
		'ELT',
		'EXP',
		'EXPM1',
		'FACTORIAL',
		'FIND_IN_SET',
		'FLOAT',
		'FLOOR',
		'FORALL',
		'FORMAT_NUMBER',
		'FORMAT_STRING',
		'FROM_CSV',
		'GETBIT',
		'HASH',
		'HEX',
		'HYPOT',
		'INITCAP',
		'INLINE',
		'INLINE_OUTER',
		'INPUT_FILE_BLOCK_LENGTH',
		'INPUT_FILE_BLOCK_START',
		'INPUT_FILE_NAME',
		'INSTR',
		'INT',
		'ISNAN',
		'ISNOTNULL',
		'ISNULL',
		'JAVA_METHOD',
		'LCASE',
		'LEFT',
		'LENGTH',
		'LEVENSHTEIN',
		'LN',
		'LOCATE',
		'LOG',
		'LOG10',
		'LOG1P',
		'LOG2',
		'LOWER',
		'LPAD',
		'LTRIM',
		'MAP_FILTER',
		'MAP_ZIP_WITH',
		'MD5',
		'MOD',
		'MONOTONICALLY_INCREASING_ID',
		'NAMED_STRUCT',
		'NANVL',
		'NEGATIVE',
		'NVL',
		'NVL2',
		'OCTET_LENGTH',
		'OVERLAY',
		'PARSE_URL',
		'PI',
		'PMOD',
		'POSEXPLODE',
		'POSEXPLODE_OUTER',
		'POSITION',
		'POSITIVE',
		'POW',
		'POWER',
		'PRINTF',
		'RADIANS',
		'RAISE_ERROR',
		'RAND',
		'RANDN',
		'RANDOM',
		'REFLECT',
		'REGEXP_EXTRACT',
		'REGEXP_EXTRACT_ALL',
		'REGEXP_LIKE',
		'REGEXP_REPLACE',
		'REPEAT',
		'REPLACE',
		'REVERSE',
		'RIGHT',
		'RINT',
		'ROUND',
		'RPAD',
		'RTRIM',
		'SCHEMA_OF_CSV',
		'SENTENCES',
		'SHA',
		'SHA1',
		'SHA2',
		'SHIFTLEFT',
		'SHIFTRIGHT',
		'SHIFTRIGHTUNSIGNED',
		'SIGN',
		'SIGNUM',
		'SIN',
		'SINH',
		'SMALLINT',
		'SOUNDEX',
		'SPACE',
		'SPARK_PARTITION_ID',
		'SPLIT',
		'SQRT',
		'STACK',
		'SUBSTR',
		'SUBSTRING',
		'SUBSTRING_INDEX',
		'TAN',
		'TANH',
		'TIMESTAMP',
		'TINYINT',
		'TO_CSV',
		'TRANSFORM_KEYS',
		'TRANSFORM_VALUES',
		'TRANSLATE',
		'TRIM',
		'TRY_ADD',
		'TRY_DIVIDE',
		'TYPEOF',
		'UCASE',
		'UNBASE64',
		'UNHEX',
		'UPPER',
		'UUID',
		'VERSION',
		'WIDTH_BUCKET',
		'XPATH',
		'XPATH_BOOLEAN',
		'XPATH_DOUBLE',
		'XPATH_FLOAT',
		'XPATH_INT',
		'XPATH_LONG',
		'XPATH_NUMBER',
		'XPATH_SHORT',
		'XPATH_STRING',
		'XXHASH64',
		'ZIP_WITH',
	],
};

/**
 * Priority 5 (last)
 * Full list of reserved words
 * any words that are in a higher priority are removed
 */
// https://deepkb.com/CO_000013/en/kb/IMPORT-fbfa59f0-2bf1-31fe-bb7b-0f9efe9932c6/spark-sql-keywords
const reservedKeywords = [
	'ADD',
	'AFTER',
	'ALL',
	'ALTER',
	'ANALYZE',
	'AND',
	'ANTI',
	'ANY',
	'ARCHIVE',
	'ARRAY',
	'AS',
	'ASC',
	'AT',
	'AUTHORIZATION',
	'BETWEEN',
	'BOTH',
	'BUCKET',
	'BUCKETS',
	'BY',
	'CACHE',
	'CASCADE',
	'CAST',
	'CHANGE',
	'CHECK',
	'CLEAR',
	'CLUSTER',
	'CLUSTERED',
	'CODEGEN',
	'COLLATE',
	'COLLECTION',
	'COLUMN',
	'COLUMNS',
	'COMMENT',
	'COMMIT',
	'COMPACT',
	'COMPACTIONS',
	'COMPUTE',
	'CONCATENATE',
	'CONSTRAINT',
	'COST',
	'CREATE',
	'CROSS',
	'CUBE',
	'CURRENT',
	'CURRENT_DATE',
	'CURRENT_TIME',
	'CURRENT_TIMESTAMP',
	'CURRENT_USER',
	'DATA',
	'DATABASE',
	'DATABASES',
	'DAY',
	'DBPROPERTIES',
	'DEFINED',
	'DELETE',
	'DELIMITED',
	'DESC',
	'DESCRIBE',
	'DFS',
	'DIRECTORIES',
	'DIRECTORY',
	'DISTINCT',
	'DISTRIBUTE',
	'DIV',
	'DROP',
	'ESCAPE',
	'ESCAPED',
	'EXCEPT',
	'EXCHANGE',
	'EXISTS',
	'EXPORT',
	'EXTENDED',
	'EXTERNAL',
	'EXTRACT',
	'FALSE',
	'FETCH',
	'FIELDS',
	'FILTER',
	'FILEFORMAT',
	'FIRST',
	'FIRST_VALUE',
	'FOLLOWING',
	'FOR',
	'FOREIGN',
	'FORMAT',
	'FORMATTED',
	'FULL',
	'FUNCTION',
	'FUNCTIONS',
	'GLOBAL',
	'GRANT',
	'GROUP',
	'GROUPING',
	'HOUR',
	'IF',
	'IGNORE',
	'IMPORT',
	'IN',
	'INDEX',
	'INDEXES',
	'INNER',
	'INPATH',
	'INPUTFORMAT',
	'INTERSECT',
	'INTERVAL',
	'INTO',
	'IS',
	'ITEMS',
	'KEYS',
	'LAST',
	'LAST_VALUE',
	'LATERAL',
	'LAZY',
	'LEADING',
	'LEFT',
	'LIKE',
	'LINES',
	'LIST',
	'LOCAL',
	'LOCATION',
	'LOCK',
	'LOCKS',
	'LOGICAL',
	'MACRO',
	'MAP',
	'MATCHED',
	'MERGE',
	'MINUTE',
	'MONTH',
	'MSCK',
	'NAMESPACE',
	'NAMESPACES',
	'NATURAL',
	'NO',
	'NOT',
	'NULL',
	'NULLS',
	'OF',
	'ONLY',
	'OPTION',
	'OPTIONS',
	'OR',
	'ORDER',
	'OUT',
	'OUTER',
	'OUTPUTFORMAT',
	'OVER',
	'OVERLAPS',
	'OVERLAY',
	'OVERWRITE',
	'OWNER',
	'PARTITION',
	'PARTITIONED',
	'PARTITIONS',
	'PERCENT',
	'PLACING',
	'POSITION',
	'PRECEDING',
	'PRIMARY',
	'PRINCIPALS',
	'PROPERTIES',
	'PURGE',
	'QUERY',
	'RANGE',
	'RECORDREADER',
	'RECORDWRITER',
	'RECOVER',
	'REDUCE',
	'REFERENCES',
	'RENAME',
	'REPAIR',
	'REPLACE',
	'RESPECT',
	'RESTRICT',
	'REVOKE',
	'RIGHT',
	'RLIKE',
	'ROLE',
	'ROLES',
	'ROLLBACK',
	'ROLLUP',
	'ROW',
	'ROWS',
	'SCHEMA',
	'SECOND',
	'SELECT',
	'SEMI',
	'SEPARATED',
	'SERDE',
	'SERDEPROPERTIES',
	'SESSION_USER',
	'SETS',
	'SHOW',
	'SKEWED',
	'SOME',
	'SORT',
	'SORTED',
	'START',
	'STATISTICS',
	'STORED',
	'STRATIFY',
	'STRUCT',
	'SUBSTR',
	'SUBSTRING',
	'TABLE',
	'TABLES',
	'TBLPROPERTIES',
	'TEMPORARY',
	'TERMINATED',
	'TO',
	'TOUCH',
	'TRAILING',
	'TRANSACTION',
	'TRANSACTIONS',
	'TRIM',
	'TRUE',
	'TRUNCATE',
	'UNARCHIVE',
	'UNBOUNDED',
	'UNCACHE',
	'UNIQUE',
	'UNKNOWN',
	'UNLOCK',
	'UNSET',
	'USE',
	'USER',
	'USING',
	'VIEW',
	'WINDOW',
	'YEAR',
	// other
	'ANALYSE',
	'ARRAY_ZIP',
	'COALESCE',
	'CONTAINS',
	'CONVERT',
	'CURRENT ROW',
	'DAYS',
	'DAY_HOUR',
	'DAY_MINUTE',
	'DAY_SECOND',
	'DECODE',
	'DEFAULT',
	'DISTINCTROW',
	'ENCODE',
	'EXPLODE',
	'EXPLODE_OUTER',
	'FIXED',
	'GREATEST',
	'GROUP_CONCAT',
	'HOURS',
	'HOUR_MINUTE',
	'HOUR_SECOND',
	'IFNULL',
	'LEAST',
	'LEVEL',
	'MINUTE_SECOND',
	'NULLIF',
	'OFFSET',
	'ON DELETE',
	'ON UPDATE',
	'OPTIMIZE',
	'REGEXP',
	'SEPARATOR',
	'SIZE',
	'STRING',
	'TYPE',
	'TYPES',
	'UNSIGNED',
	'VARIABLES',
	'YEAR_MONTH',
];

/**
 * Priority 1 (first)
 * keywords that begin a new statement
 * will begin new indented block
 */
// http://spark.apache.org/docs/latest/sql-ref-syntax.html
const reservedCommands = [
	// DDL
	'ALTER COLUMN',
	'ALTER DATABASE',
	'ALTER TABLE',
	'ALTER VIEW',
	'CREATE DATABASE',
	'CREATE FUNCTION',
	'CREATE TABLE',
	'CREATE VIEW',
	'DROP DATABASE',
	'DROP FUNCTION',
	'DROP TABLE',
	'DROP VIEW',
	'REPAIR TABLE',
	'TRUNCATE TABLE',
	'USE DATABASE',
	// DML
	'INSERT INTO',
	'INSERT OVERWRITE',
	'INSERT OVERWRITE DIRECTORY',
	'LOAD',
	// Data Retrieval
	'SELECT',
	'WITH',
	'CLUSTER BY',
	'DISTRIBUTE BY',
	'PARTITION BY', // verify
	'GROUP BY',
	'HAVING',
	'VALUES',
	'LIMIT',
	'OFFSET',
	'ORDER BY',
	'SORT BY',
	'TABLESAMPLE',
	'WHERE',
	'PIVOT',
	'TRANSFORM',
	'EXPLAIN',
	// Auxiliary
	'ADD FILE',
	'ADD JAR',
	'ANALYZE TABLE',
	'CACHE TABLE',
	'CLEAR CACHE',
	'DESCRIBE DATABASE',
	'DESCRIBE FUNCTION',
	'DESCRIBE QUERY',
	'DESCRIBE TABLE',
	'LIST FILE',
	'LIST JAR',
	'REFRESH',
	'REFRESH TABLE',
	'REFRESH FUNCTION',
	'RESET',
	'SET',
	'SET SCHEMA', // verify
	'SHOW COLUMNS',
	'SHOW CREATE TABLE',
	'SHOW DATABASES',
	'SHOW FUNCTIONS',
	'SHOW PARTITIONS',
	'SHOW TABLE EXTENDED',
	'SHOW TABLES',
	'SHOW TBLPROPERTIES',
	'SHOW VIEWS',
	'UNCACHE TABLE',
	// other
	'FROM',
	'INSERT',
	'UPDATE',
	'WINDOW', // verify
];

/**
 * Priority 2
 * commands that operate on two tables or subqueries
 * two main categories: joins and boolean set operators
 */
const reservedBinaryCommands = [
	// set booleans
	'INTERSECT',
	'INTERSECT ALL',
	'INTERSECT DISTINCT',
	'UNION',
	'UNION ALL',
	'UNION DISTINCT',
	'EXCEPT',
	'EXCEPT ALL',
	'EXCEPT DISTINCT',
	'MINUS',
	'MINUS ALL',
	'MINUS DISTINCT',
	// joins
	'JOIN',
	'INNER JOIN',
	'LEFT JOIN',
	'LEFT OUTER JOIN',
	'RIGHT JOIN',
	'RIGHT OUTER JOIN',
	'FULL JOIN',
	'FULL OUTER JOIN',
	'CROSS JOIN',
	'NATURAL JOIN',
	// apply
	'CROSS APPLY',
	'OUTER APPLY',
	// non-standard-joins
	'ANTI JOIN',
	'SEMI JOIN',
	'LEFT ANTI JOIN',
	'LEFT SEMI JOIN',
	'RIGHT OUTER JOIN',
	'RIGHT SEMI JOIN',
	'NATURAL ANTI JOIN',
	'NATURAL FULL OUTER JOIN',
	'NATURAL INNER JOIN',
	'NATURAL LEFT ANTI JOIN',
	'NATURAL LEFT OUTER JOIN',
	'NATURAL LEFT SEMI JOIN',
	'NATURAL OUTER JOIN',
	'NATURAL RIGHT OUTER JOIN',
	'NATURAL RIGHT SEMI JOIN',
	'NATURAL SEMI JOIN',
	'CROSS APPLY',
	'OUTER APPLY',
];

/**
 * Priority 3
 * keywords that follow a previous Statement, must be attached to subsequent data
 * can be fully inline or on newline with optional indent
 */
const reservedDependentClauses = ['ON', 'WHEN', 'THEN', 'ELSE', 'LATERAL VIEW'];

// http://spark.apache.org/docs/latest/sql-programming-guide.html
export default class SparkSqlFormatter extends Formatter {
	static reservedCommands = reservedCommands;
	static reservedBinaryCommands = reservedBinaryCommands;
	static reservedDependentClauses = reservedDependentClauses;
	static reservedLogicalOperators = ['AND', 'OR', 'XOR'];
	static reservedKeywords = [
		...Object.values(reservedFunctions).reduce((acc, arr) => [...acc, ...arr], []),
		...reservedKeywords,
	];
	static stringTypes: StringPatternType[] = [`""`, "''", '``', '{}'];
	static blockStart = ['(', 'CASE'];
	static blockEnd = [')', 'END'];
	static indexedPlaceholderTypes = ['?'];
	static namedPlaceholderTypes = ['$'];
	static lineCommentTypes = ['--'];
	static operators = ['<=>', '&&', '||', '=='];

	tokenizer() {
		return new Tokenizer({
			reservedCommands: SparkSqlFormatter.reservedCommands,
			reservedBinaryCommands: SparkSqlFormatter.reservedBinaryCommands,
			reservedDependentClauses: SparkSqlFormatter.reservedDependentClauses,
			reservedLogicalOperators: SparkSqlFormatter.reservedLogicalOperators,
			reservedKeywords: SparkSqlFormatter.reservedKeywords,
			stringTypes: SparkSqlFormatter.stringTypes,
			blockStart: SparkSqlFormatter.blockStart,
			blockEnd: SparkSqlFormatter.blockEnd,
			indexedPlaceholderTypes: SparkSqlFormatter.indexedPlaceholderTypes,
			namedPlaceholderTypes: SparkSqlFormatter.namedPlaceholderTypes,
			lineCommentTypes: SparkSqlFormatter.lineCommentTypes,
			operators: SparkSqlFormatter.operators,
		});
	}

	tokenOverride(token: Token) {
		// Fix cases where names are ambiguously keywords or functions
		if (isToken('WINDOW')(token)) {
			const aheadToken = this.tokenLookAhead();
			if (aheadToken?.type === TokenType.BLOCK_START) {
				// This is a function call, treat it as a reserved word
				return { type: TokenType.RESERVED_KEYWORD, value: token.value };
			}
		}

		if (isToken('END')(token)) {
			const backToken = this.tokenLookBehind();
			if (backToken?.type === TokenType.OPERATOR && backToken?.value === '.') {
				// This is window().end (or similar) not CASE ... END
				return { type: TokenType.WORD, value: token.value };
			}
		}

		// TODO: deprecate this once ITEMS is merged with COLLECTION
		if (/ITEMS/i.test(token.value) && token.type === TokenType.RESERVED_KEYWORD) {
			if (
				!(
					/COLLECTION/i.test(this.tokenLookBehind()?.value) &&
					/TERMINATED/i.test(this.tokenLookAhead()?.value)
				)
			) {
				// this is a word and not COLLECTION ITEMS
				return { type: TokenType.WORD, value: token.value };
			}
		}

		return token;
	}
}
