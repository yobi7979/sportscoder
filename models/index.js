const { Sequelize, DataTypes, Op } = require('sequelize');
const path = require('path');

// Sequelize 인스턴스 생성
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../sports.db'),
  logging: false,
  benchmark: false
});

// Match 모델 정의
const Match = sequelize.define('Match', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  sport_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  home_team: {
    type: DataTypes.STRING,
    allowNull: false
  },
  away_team: {
    type: DataTypes.STRING,
    allowNull: false
  },
  home_team_color: {
    type: DataTypes.STRING,
    defaultValue: '#1d4ed8'
  },
  away_team_color: {
    type: DataTypes.STRING,
    defaultValue: '#dc2626'
  },
  home_team_header: {
    type: DataTypes.STRING,
    defaultValue: 'HOME'
  },
  away_team_header: {
    type: DataTypes.STRING,
    defaultValue: 'AWAY'
  },
  home_score: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  away_score: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
  },
  match_data: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  tableName: 'Matches'
});

// Template 모델 정의
const Template = sequelize.define('Template', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sport_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  template_type: {
    type: DataTypes.ENUM('control', 'overlay'),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  is_default: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  created_by: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  tableName: 'templates',
  underscored: true
});

// 경기 생성 시 스포츠 타입에 따른 기본 데이터 구조 설정
Match.beforeCreate((match) => {
  // 날짜와 종목 코드를 조합한 ID 생성
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateCode = `${month}${day}`;
  
  // 종목 코드 설정
  let sportCode = '';
  if (match.sport_type === 'soccer') {
    sportCode = 'SC';
  } else if (match.sport_type === 'baseball') {
    sportCode = 'BB';
  }
  
  // 현재 시간을 밀리초로 가져와서 순번으로 사용
  const timestamp = Date.now();
  const sequence = String(timestamp % 100).padStart(2, '0');  // 항상 2자리 숫자가 되도록 수정
  
  // 새 ID 설정: 날짜 + 종목코드 + 순번
  match.id = `${dateCode}${sportCode}${sequence}`;
  
  // 기본 경기 데이터 설정
  if (match.sport_type === 'soccer') {
    match.match_data = {
      ...match.match_data,
      state: '전반',
      home_shots: 0,
      away_shots: 0,
      home_shots_on_target: 0,
      away_shots_on_target: 0,
      home_corners: 0,
      away_corners: 0,
      home_fouls: 0,
      away_fouls: 0,
      timer: 0,
      lastUpdateTime: Date.now(),
      isRunning: false
    };
  } else if (match.sport_type === 'baseball') {
    match.match_data = {
      ...match.match_data,
      current_inning: 1,
      inning_type: 'top',
      first_base: false,
      second_base: false,
      third_base: false,
      balls: 0,
      strikes: 0,
      outs: 0,
      batter_name: '',
      batter_number: '',
      batter_position: '',
      batter_avg: '',
      pitcher_name: '',
      pitcher_number: '',
      pitcher_position: '',
      pitcher_era: '',
      home_hits: 0,
      away_hits: 0,
      home_errors: 0,
      away_errors: 0,
      innings: {},
      timer: 0,
      lastUpdateTime: Date.now(),
      isRunning: false
    };
  }
});

// 데이터베이스 연결 및 테이블 생성
sequelize.sync()
  .then(() => {
    // 연결 성공 로그 제거
  })
  .catch(err => {
    console.error('데이터베이스 연결 실패:', err);
  });

module.exports = {
  sequelize,
  Match,
  Template,
  Op
}; 