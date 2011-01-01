# -*- coding: utf-8 -*-
# vim: set fileencoding=utf-8 :
#
#  shogi_model.rb
#
require 'lib/store.rb'
class Board
  Board::Initial_board_string =
   'lxpxxxPxLnbpxxxPRNsxpxxxPxSgxpxxxPxGkxpxxxPxKgxpxxxPxGsxpxxxPxSnrpxxxPBNlxpxxxPxL';
  def self.initial_board_string
    Board::Initial_board_string
  end

  def initialize(logger=Logger.new('log/board.log'))
    @blogger = logger
    @store  = Store.new
    @bid   = 1
    @board = Board::Initial_board_string.clone
    @black = ''
    @white = ''
    @turn  = true
  end
  attr_accessor :store, :bid, :board, :black, :white, :turn

  #
  #  apply(line)
  #  lineで表現された指し手を現在のboardに適用する
  #  @storeからとれる情報をとり、自らの情報を追加しHashを組み立て返す
  #  入力: line 文字列 CSA形式の指し手文字列 例：+7776FU
  #  出力: delta Wave::StateにsubmitできるHash
  def apply(line)
    @blogger.debug("entered in apply with #{line}")
    ret = {}
    @turn = !@turn
    ret['turn'] = (@turn ? 't' : 'f')
    move = Move.new
    move.parse_csa(self, line)
    move[:bid] = @bid
    @blogger.debug("#{line} is converted to Move object : #{move.inspect}")
    _apply(move)
    @bid = (@store.complement(self, move))[0].bid
    buf = ''
    @blogger.debug("@store became #{PP::pp(@store, buf);buf}")
    @blogger.debug("@bid became : #@bid")
    tmp = @store.get_section @bid
    @blogger.debug("get_section @bid : #{tmp.inspect}")
    ret['bid'] = @bid
    ret.merge! tmp
    @blogger.debug("leaving from apply with #{ret.inspect}")
    ret
  end

  #
  #  get_piece(pairdec)
  #    盤上の駒の文字を取得する
  #    入力: 2桁の数字 7六 -> 76
  #    出力: 文字
  #
  def get_piece(pairdec)
    @board[pairdec2index(pairdec)].chr
  end

  #
  #  to_log
  #    logに自身を記録するための文字列を返す
  #    入力: なし
  #    出力: 変換後の文字列
  #
  def to_log
    " bid:#@bid, turn:#@turn,\n board:#@board,\n black:#@black, white:#@white,\n" +
    " size of store : board -> #{(@store['board'] || []).size},\n" +
    "               : nextMoves -> #{(@store['nextMoves'] || []).size},\n" +
    "               : prevMoves -> #{(@store['prevMoves'] || []).size}"
  end

  #private
  #
  #  _apply(move)
  #
  def _apply(move)
    @blogger.debug("entered in _apply with #{move.inspect}")
    @blogger.debug("@board : #{@board}")
    @blogger.debug("@black : #{@black}")
    @blogger.debug("@white : #{@white}")
    players_stand  = (move[:piece].upcase == move[:piece] ? @black : @white)
    destination_piece = @board[pairdec2index(move[:m_to])].chr
    case
      when move.from_hand # 持ち駒を打つとき
        players_stand.sub! move[:piece], ''
        @board[pairdec2index(move[:m_to])] = move[:piece]
      when move.on_board  # 盤上の指し手
        if destination_piece != 'x'  # 駒をとる
           players_stand += destination_piece.swapcase
        end 
        if move[:promote]   # 成り
          @board[pairdec2index(move[:m_to])] = move.promoted_piece
        else                # 成りではない
          @board[pairdec2index(move[:m_to])] = move[:piece]
        end
        @board[pairdec2index(move[:m_from])] = 'x'
    end
    @blogger.debug("leaving from _apply with :")
    @blogger.debug("@board : #{@board}")
    @blogger.debug("@black : #{@black}")
    @blogger.debug("@white : #{@white}")
  end

  # pairdec とは7六 -> 76のように盤の符号を10進の数字にしたもの
  #    入力: 2桁の数字 7六 -> 76
  #    出力: [7,6]のように符号を数字の組pairにして配列にして返す
  def pairdec2pair(pairdec)
    pairdec.divmod 10
  end

  # pair2index とは7六 -> [7,6]のように盤の符号数字の配列を
  #  @board文字列のindexに変換して返す(0始まり。1一が0)
  #    入力: [7,6]のように符号を数字の組pairにした配列
  #    出力: 数字
  def pair2index(x, y)
    (x-1)*9 + y - 1
  end
  def pairdec2index(pairdec)
    pair2index(*pairdec2pair(pairdec))
  end
end


  #  Moveオブジェクト DB上のmoveの形式
  #          例： +7776FU  ->  [:bid => 適用対象のBoardのbid,
  #                             :m_from => 77,
  #                             :m_to   => 76,
  #                             :piece  => 'P',
  #                             :promote => false,
  #                             :nxt_bid =>  適用後のBoardのbid]
class Move < Hash
  @@pieces = {'FU' => 'p', 'KY' => 'l', 'KE' => 'n', 'GI' => 's',
              'KI' => 'g', 'OU' => 'k', 'HI' => 'r', 'KA' => 'b',
              'TO' => 'q', 'NY' => 'm', 'NK' => 'o', 'NG' => 't',
              'UM' => 'h', 'RY' => 'd'}
  def self.pieces
    @@pieces
  end
  
  @@promotes = {'p' => 'q', 'l' => 'm', 'n' => 'o', 's' => 't', 'r' => 'd', 'b' => 'h' }
  @@un_promotes = {'q' => 'p', 'm' => 'l', 'o' => 'n', 't' => 's', 'd' => 'r', 'h' => 'b' }

  def initialize(ary = [], logger=Logger.new('log/move.log'))
    @mlogger = logger
    super(ary)
    self[:m_from]  = ary[0]
    self[:m_to]    = ary[1]
    self[:piece]   = ary[2]
    self[:promote] = ary[3]
  end
  #
  #  parse_csa
  #    CSA形式の指し手文字列を読み自身にとりこむ
  #    入力: board Boardオブジェクト
  #        : line 文字列 CSA形式の指し手文字列 例：+7776FU
  #        この文字列に改行がついていたら取りさって評価する
  #    出力: なし
  #          例： +7776FU  ->  [77, 76, P, false]
  #  注意：このメソッドにはこの手を指した盤面が必要
  #  その理由：DB上のmove形式とcsa形式の定義の違い
  #    成り駒の扱い：DBでは成る前の状態の駒の名前を保持
  #                  CSAでは成った後の駒の名前を表示
  #    CSAでは盤面がないと、その手が成りかどうかわからないのに
  #    DBではその手だけでわかることを要求している
  #
  def parse_csa(board, line)
    @mlogger.debug("into parse_csa with\n board : #{board.board},\n black : #{board.black},\n white : #{board.white}")
    @mlogger.debug("and line: #{line}")
    line.chomp!
    self[:bid]    = board.bid
    self[:turn]   = (line[0] == '+'[0])
    self[:m_from] = line[1,2].to_i
    self[:m_to]   = line[3,4].to_i
    self[:piece]  = board.get_piece(self[:m_from])
    self[:promote] = false
    if  'qmothd'.index(@@pieces[ line[5,6] ]) and # 動かした駒が成り駒,かつ
        'plnsbr'.index(self[:piece].downcase) then
                                    # 動かす前が成り駒でないとき
      self[:promote] = true  
    end
    @mlogger.debug("leaving parse_csa with board : #{@board}")
  end

  def from_hand
    self[:m_from] == 0
  end

  def on_board
    self[:m_from] != 0
  end

  def promoted_piece
    if self[:piece].downcase == self[:piece]
      @@promotes[self[:piece].downcase]
    else
      @@promotes[self[:piece].downcase].upcase
    end
  end
end
