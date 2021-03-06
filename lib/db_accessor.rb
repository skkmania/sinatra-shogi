# -*- coding: utf-8 -*-
# vi: ts=2 sw=2 sts=0 ai ambw=double fo=tcq
#
#  db_accessor.rb
#
#  入力: bid, uid, mask, level, range
#        mask : どのデータを取得するかを示す２進数の10進表現
#        level: bidから始まって収集するデータの深さ
#        range: full, onlyの二値のうちどちらか。fullは 1..levelの全階層のデータを収集。onlyはlevelのみ。
$:.unshift File.dirname(__FILE__)
require 'date'
require '24kifu_tools.rb'
require '2chkifutools.rb'
require 'post_book_query.rb'
require 'logger' unless Logger
require 'sequel'
# localhostへの接続
DB = Sequel.connect("postgres://skkmania:skkmania@ubu-pg84:5432/shogi84",
    :max_connections => 10, :logger => Logger.new('log/db.log'))

# utility
  class Hash
    # keyの配列を渡すと、その順に並べたvalueの配列を返す
    # 値の存在しないkeyが含まれると、その場所にはnilがはいる
    def to_a_with_order(ary)
      ary.inject([]){|res, e| res.push self[e].to_s }
    end
    def board_hash_to_s
      to_a_with_order([:bid,:turn,:board,:black,:white]).map{|e|
        sprintf("%5s", e) }.join(',')
    end
    def move_hash_to_s
      ret = ''
      to_a_with_order([:bid,:mid,:m_from,:m_to,:piece,:promote,:nxt_bid]).each_with_index{|e, i|
        case i
          when 0
            ret += sprintf("%6s", e) + ','
          when 1,2,3,4
            ret += sprintf("%2s", e) + ','
          when 5
            ret += sprintf("%5s", e) + ','
          when 6
            ret += sprintf("%6s", e)
        end
      }
      ret
    end
  end

class DbAccessor
  def initialize(param={}, logger=Logger.new('log/db_accessor.log'))
    @logger = logger
    @logger.debug { 'DbAccessor new : param : ' + param.to_s }
    @logger.debug { "DbAccessor new : param bid : #{param['bid'] or 'nothing'}" }
    read_params(param)
    @data_name = %w|board nextMoves prevMoves movePointsByUser movePointsAverage moveComments boardPointByUser boardPointAverage boardComments|
    set_masked_data_name
    
    @post_book_query = ''
    @bids = []
    @res = ''
    @gotten = {}
    @logger.debug { 'DbAccessor new : leaving : ' }
  end
  attr_accessor :params, :gotten, :logger, :masked_data_name
  
  def read_params(param)
    @params	= param
    @bid	= @params['oldbid'] || @params['bid'] || 1
    @name	= @params['name']
    @uid	= @params['uid']
    @mask	= @params['mask'].to_i
    @level	= @params['level']
    @range	= @params['range']
    @turn	= @params['turn']
    @board	= @params['board']
    @black	= @params['black']
    @white	= @params['white']
    @from	= @params['from']
    @to		= @params['to']
    @piece	= @params['piece']
    @promote	= @params['promote']
    @oldbid	= @params['oldbid']
    @kid	= @params['kid']
    @moves	= @params['moves']
    @player1	= @params['player1']
    @player2	= @params['player2']
    @win	= @params['win']
    @date	= @params['date']
  end

  def set_masked_data_name
    @logger.debug { "set_masked_data_name : entered : #@mask" }
    @masked_data_name = []
    @data_name.each_with_index{|e,i| @masked_data_name.push e if @mask[i] == 1 }
    @logger.debug { "set_masked_data_name : leaving : #@masked_data_name" }
  end

  def send_query(query)
    DB[query].all
  end

  def queries
    bids_expr = @bids.join(',').gsub('bid','')
    {
    "board"		=> "select * from boards where bid in ( #{bids_expr} );",
    "nextMoves"	=> "select * from moves where bid in ( #{bids_expr} ) order by mid;",
    "prevMoves"	=> "select * from moves where nxt_bid in ( #{bids_expr} );",
    "movePointsByUser"=> "select bid, mid, point as personal from move_point_user
    			 where bid in ( #{bids_expr} ) and userid = #{@uid} order by bid,mid;",
    "movePointsAverage"=> "select bid, mid, point as total from move_points
    			 where bid in ( #{bids_expr} ) order by bid,mid;",
    "moveComments"	=> "select bid,mid,mcomment,userid,uname from move_comments natural inner join users where bid in ( #{bids_expr} ) order by mid;",
    "boardPointByUser"=> "select bid, coalesce(sum(pbpoint), 0) as pbpoint from boardp_users where bid in ( #{bids_expr} ) and userid = #{@uid} group by bid;",
    "boardPointAverage"=> "select bid, coalesce(sum(bpoint), 0) as bpoint from board_points where bid in ( #{bids_expr} ) group by bid;",
    "boardComments"	=> "select bid, bcomment,userid,uname from board_comments natural inner join users where bid in ( #{bids_expr} ) order by userid;",
    "book"		=> "select * from get_book_with_meta(#{@kid});",
    }
  end
  
  def determine_bid_range
    @logger.debug { "into determine_bid_range : #@range" } 
    case @range
      when 'full'
        #query = "select bid, nxts, pres from cc_getBids(#{@bid}, #{@level});"
        query = "SELECT * from  getChildBidsFullSQL(#{@bid}, #{@level}) AS bid;"
      when 'only'
			  # 未実装
        # query = "SELECT * from  getChildBidsOnlySQL(#{@bid}, #{@level}) AS bid;"
    end
    @logger.debug { "  query became : #{query}" } 

    begin
      kekka = DB[query]
      @logger.debug { '  result of query : ' + kekka.inspect } 
      @bids = kekka.map(:bid)
			@bids.push @bid
			  # getChildは@bidの子孫しか返さないので@bidは含まない
			  # しかしクライアントは@bidも@bidsに含めてほしいので追加しておく
      @logger.debug { '  bid_range became : ' + @bids.join(',') } 
    rescue => error
      @logger.error { "determine_bid_range : error !" + error.message } 
      print 'error'
    ensure
      #kekka.clear if kekka
    end
  end
=begin
  [{"pres":"{}", "bid":"1", "nxts":"{4,798,1024,1388,26624,49916,66984,92020,94600,94602,94604,94606,94608}"}, {"pres":"{1}", "bid":"4", "nxts":"{3,113,21195,
  
  {:nxts=>"{3,235}", :pres=>"{1}", :bid=>2}   
=end

  # @gottenの出力を読みやすく整形する
  # 入力 obj @gottenを受け取ることを想定. @gottenは hash である
  #          sectionも受け取ることにする。keyの名が異なるので対応が必要
  #          (これは将来、keyの名を統一することで解消すべき)
  # 出力 ret @gottenの値を整形した文字列
  def log_format(obj)
    return "obj has no board info" unless obj.has_key? 'board'
    # この処理は暫定
    if obj.has_key? 'next'
      next_key = 'next'; prev_key = 'prev'
    end
    if obj.has_key? 'nextMoves'
      next_key = 'nextMoves'; prev_key = 'prevMoves'
    end
    moves_tos = lambda{|obj, name, key|
      ret = ''
      nmgrp = obj[name].group_by{|m| m[key] }.sort
        # group_byの結果はHash. 与えられたkeyでgroupに分ける。
        # nextMovesならbidで分類すべきで、
        # prevMovesならnxt_bidで分類すべき.

      nmgrp.each{|bid, moves|
        ret += "\n"
        moves.each_with_index{|m, i|
          ret += m.move_hash_to_s + " :"
          ret += "\n" if (i+1) % 4 == 0
        }
        ret += "\n"
      }
      return ret
    }
    total = "board :\n"
      # obj['board'] は array. その要素はhash
    total += obj['board'].map(&:board_hash_to_s).join("\n")

    total += "\n" + next_key + " :\n"
    total += moves_tos.call(obj, next_key, :bid)

    total += "\n" + prev_key + " :\n"
    total += moves_tos.call(obj, prev_key, :nxt_bid)
    return total
  end
  
  #
  # result_format
  #
  def result_format(result)
  end
  #
  # get_msg
  #   @maskで指定したデータをDBから取得する
  #   入力 : なし 実質的には@masked_data_nameがその役割をはたす
  #   出力 : DBから取得したデータをまとめたHash @gottenというプロパティに格納される
  #
  def get_msg
    @logger.debug { "DbAccessor#get_msg is called. 取得するdataの名は : #{@masked_data_name.join(',')}" } 
    @gotten = @masked_data_name.inject({}){|res_hash, name|
      @logger.debug { "#{name} のdataを取得する" } 
      @logger.debug { "そのqueryは, #{queries[name]}" }
      result = DB[queries[name]].all
      res_hash[name] = result
      res_hash
    }
    @logger.debug { "その結果は,\n#{log_format @gotten}" } 
    return @gotten
  end

  def get_book
    @logger.debug { "get_book : query : #{queries['book']}" } 
    result = DB[queries['book']].all
    result[0][:gdate] = result[0][:gdate].to_s
    @logger.debug { "get_book : result.inspect : #{result.inspect}" } 
    return result.to_msgpack
  end

  #
  # post_book
  # 入力(params) paramsのtextキーで渡される。24kifファイルの全文
  # 出力 kifsのレコードのハッシュ(をmsgpackで固めた文字列)
  #
  def post_book
    @logger.debug { "into post_book" } 
    @logger.debug { "given kif text : " + @params['text'] }

    # 受け取った棋譜ファイルを、メタデータと、指し手をバイト列にならべたものにする
    meta_data = kif_info(@params['text'])
    @logger.debug { "meta_data from kif : " + meta_data.inspect }
    byte_data = txt2movebytes(@params['text'])
    @logger.debug { "byte_data from kif : " + byte_data.inspect }

    # DBに棋譜を登録する前準備
    r1 = 'delete from kifread;'
    r1 += 'delete from new_boards;'
    r1 += 'delete from new_moves;'
    result = DB.run(r1)
    @logger.debug { "result of r1 : #{result.inspect}" } 

    # バイトデータをkifreadに登録するためのハッシュに変換
    ha = bytes_to_array_of_hash(byte_data, byte_data.length/2)
    @logger.debug { "hash from byte_data : #{ha.inspect}" } 
    # それをkifreadに登録
    result = DB[:kifread].insert_multiple(ha)

    # kif_insertにより、kifreadからmoves,boards,kifsにデータを移す
    result = DB[:kif_insert.sql_function(nil, meta_data['g'], meta_data['b'], meta_data['w'], meta_data['r'])].all
    @logger.debug { "result of kif_insert : #{result.inspect}" } 

    # responseを作成するために、登録した棋譜を改めて取得
    result = DB[:get_book_with_meta.sql_function(result[0][:kid])].all
    result[0][:gdate] = result[0][:gdate].to_s
    @logger.debug { "result of post_book : #{result.inspect}" } 

    # msgpackして返す
    return result.to_msgpack
  end

  def output
    @logger.debug { "gotten : #{@gotten.inspect}" } 
    @gotten.inspect.gsub('=>',':')
  end

  def to_html
  end

  #
  #  regist_board
  #    機能 : 不明な指し手と局面をDBに問合せ,
  #           それらのmid, bidを含む結果を得る。
  #    入力 : なし。DbAccessorの各インスタンス変数により動作が決定される.
  #    出力 : つぎの2通りにわかれる
  #          新しい局面を登録した場合
  #            その局面のsectionのもとになるデータのHash
  #            返り値はHashオブジェクトであり、そのkeyは
  #            'board', 'nextMoves', 'prevMoves'という文字列
  #            それぞれの値の型は
  #            'board' : 要素数1の配列
  #                      その要素は次のようなHash
  #                      {:turn=> 論理値, :board=> 文字列, :black=> 文字列,
  #                       :bid=> Fixnum, :white=> 文字列}
  #            'nextMoves' : 要素数0の配列
  #            'prevMoves' : 要素数1の配列
  #                      その要素は次のようなHash
  #                      {:bid=> Fixnum, :mid=> Fixnum,:m_from=> Fixnum,
  #                       :m_from=> Fixnum, :m_to=> Fixnum,
  #                       :piece=> 1文字, :promote=> 論理値,
  #                       :nxt_bid=> Fixnum}
  #          既存の局面だった場合
  #            その局面のbidを起点としたget_msgの結果
  #            その型はget_msgのコメント参照
  def regist_board
    @logger.debug { 'into regist_board in DbAccessor' }
    query = "select regist_board('#{@turn}'::bool,'#{@board}'::char(81),\
      '#{@black}'::varchar(38),'#{@white}'::varchar(38),\
       #{@oldbid}::integer, #{@from}::smallint, #{@to}::smallint,\
      '#{@piece}'::char, '#{@promote}'::bool);"
    @logger.debug { "regist_board : query -> #{query}" }
    result = DB[query].all
    @logger.debug { "query done." }
    @logger.debug { "inspect of output of sequel (result.inspect) : #{result.inspect}" } 
    # 内容例：　 [{:regist_board=>"(10411,1,,,,,)"}]
    #    これは新しいボードの登録だったときで、 10411はnew_bid, 1はnew_mid
    # 内容例：　 [{:regist_board=>"(10411,,,,,,)"}]
    #    これは既存のの登録だったときで、 10411はnew_bid

    # 新手と新局面に対してmid, bidを取得したことになる
    new_bid, new_mid = result[0][:regist_board].scan(/\d+/).map(&:to_i)
    @logger.debug { "new_bid : #{new_bid},  new_mid : #{new_mid}" } 

    if new_mid
      ret = {}
      # new_midがあるということは、新しい局面を登録した場合
      @logger.debug { "this board not found, so new board was registered and got new_bid : #{new_bid}" } 
      ret['board']     = [{:bid=> new_bid,:turn=> @turn,
                           :board=>@board, :black=>@black, :white=>@white}]
      ret['nextMoves'] = []
      ret['prevMoves'] = [{:bid=> @bid, :mid=> new_mid,
                           :m_from=> @from, :m_to=> @to,
                           :piece=> @piece, :promote=> @promote,
                           :nxt_bid=> new_bid}]
         # わざとすべて文字列の値としている -> やめてみる
         # rubyのなかで処理するときは数値のままがよい
         # たしか、msgpackのbugのために文字列にした記憶があるのでjsのクライアント
         # のbugのもとになるかもしれない
         # もっとも、そのときとはmsgpackのライブラリが異なるはずなので問題ないかもしれない。それに期待。
      @logger.debug { "leaving from regist_board with hash : #{ret.inspect}" } 
      return ret
      #packed_ret = ret.to_msgpack
      #@logger.debug { "ret.msgpack : #{packed_ret}" } 
      #return packed_ret
    else
      # new_midがないということは、既存の局面だった場合
      @bid = new_bid
      @logger.debug { "@bid is set to : #{@bid}" } 
      @logger.debug { "this board exists, so try to get full range." } 
      @logger.debug { "@params now : #{@params.inspect}" } 
      determine_bid_range
      return get_msg
    end
  end
end
